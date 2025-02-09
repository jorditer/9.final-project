// frontend/src/components/Register.tsx
import { FormEvent, useState, FC } from "react";
import createChangeHandler from "../utils/form";
import api from "../services/api";  // Import our new API service
import { useNavigate } from "react-router";
import { authService } from "../services/auth";

interface RegisterProps {
  setThisUser: (user: string | null) => void;
}

const Register: FC<RegisterProps> = ({ setThisUser }) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false
  });
  
  
  const navigate = useNavigate();
  const myStorage = window.localStorage;
  const handleChange = createChangeHandler(setNewUser);

  const validatePassword = (password: string): boolean => {
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber && hasSymbol;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword(newUser.password)) {
      alert("Password must contain at least one number and one symbol");
      return;
    }
  
    try {
      const response = await api.post("/users/register", newUser);

      const { accessToken, username } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      myStorage.setItem("user", username);
      
      authService.setAuth(accessToken, username);
      setThisUser(username);
      setError(false);
      setSuccess(true);

      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.response.data.message);
     if (err.response.data.message === "Username is already taken") {
        setFieldErrors(prev => ({ ...prev, username: true }));
        console.log("username")
        console.log("username" + JSON.stringify(fieldErrors))
      } else if (err.response.data.message === "Email is already registered") {
        setFieldErrors(prev => ({ ...prev, email: true }));
        console.log("email")
        console.log("email" + JSON.stringify(fieldErrors))
      }
      console.log(errorMessage)
      setError(true);
    }
  }
  
  return (
    <>
      {/* Dark overlay */}
      <div className="z-20 fixed inset-0 bg-yellow-800 bg-opacity-40" />

      {/* Modal */}
      <div className="z-20 absolute top-1/2 left-1/2 p-2 -translate-x-1/2 -translate-y-1/2  bg-white w-2/3 sm:w-1/2 md:w-4/12">
        <div className="logo p-4 text-base">
          <h2 className="text-4xl pb-2 font-bold">Sign up</h2>
          <figcaption className="text-sm text-gray-500 pb-2">
            Already registered?{" "}
            <a 
              className="text-blue-600 hover:text-blue-400 cursor-pointer underline" 
              onClick={() => navigate('/login')}
            >
              Log into your account
            </a>
          </figcaption>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="" htmlFor="username">
              Username
            </label>
            <input 
              className={`mb-1 py-1 ${fieldErrors.username ? "input-error" : ""}`}
              name="username" 
              id="username" 
              onChange={handleChange} 
              type="text" 
              required 

              />
            <label className="" htmlFor="email">
              Email
            </label>
            <input 
              className={`py-1 ${fieldErrors.email ? "input-error" : ""}` }
              name="email" 
              id="email" 
              onChange={handleChange} 
              type="email" 
              required 
            />
            <label className="mt-1" htmlFor="password">
              Password
            </label>
            <input 
              className="py-1" 
              name="password" 
              id="password" 
              onChange={handleChange} 
              minLength={7} 
              maxLength={20} 
              type="password" 
              pattern="^(?=.*[0-9])(?=.*[!@#$%^&*<>'\\\/\]]).{7,}$" 
              required 
            />
            <div className="h-10">
              <input
                className="mt-3 text-base"
                type="submit"
                value="Sign up"
              />
            </div>
            {success && (
              <span className="text-green-600 mt-3 text-center">Success!</span>
            )}
            {error && (
              <span className="text-red-500 mt-3 text-center">{errorMessage}</span>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;