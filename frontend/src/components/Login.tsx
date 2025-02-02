import { FormEvent, useState, FC } from "react";
import createChangeHandler from "../utils/form";
import axios from "axios";
import User from "../interfaces/User";
import { useNavigate } from "react-router";
import { authService } from "../services/auth";

interface LoginProps {
  setThisUser: (user: string | null) => void;
}

const Login: FC<LoginProps> = ({ setThisUser }) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
  });

  const myStorage = window.localStorage
  const navigate = useNavigate();
  const handleChange = createChangeHandler(setNewUser);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/login", newUser);
      const { accessToken, username } = res.data;
      myStorage.setItem("user", res.data.username);

			if (res.status === 201 || res.status === 200) {
				setThisUser(res.data.username);
        authService.setAuth(accessToken, username);
				setError(false);
				setSuccess(true);
        navigate('/');
			}
    } catch (err) {
			if (axios.isAxiosError(err) && err.response) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
      setError(true)
    }
  };
  return (
    <>
      {/* Dark overlay */}
      <div className="z-20 fixed inset-0 bg-yellow-800 bg-opacity-40" />

      {/* Modal */}
      <div className="z-20 absolute top-1/2 left-1/2 p-2 -translate-x-1/2 -translate-y-1/2  bg-white w-2/3 sm:w-1/2 md:w-4/12">
        <div className="logo p-4 text-base">
          <h2 className="text-4xl pb-2 font-bold">Log in</h2>
          <figcaption className="text-sm text-gray-500 pb-2">
            Not registered? <a className="text-blue-600 hover:text-blue-400 cursor-pointer underline" onClick={() => navigate("/signup")}>Create an account</a>
          </figcaption>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="" htmlFor="username">
              Username
            </label>
            <input className="mb-1 py-1" name="username" id="username" onChange={handleChange} type="text" required />
            <label className="mt-1" htmlFor="password">
              Password
            </label>
            <input className="py-1" name="password" id="password" onChange={handleChange} minLength={7} maxLength={20} type="password" required />
            <input className="mt-3 text-base" type="submit" value="Log in" />
            {success && <span className="text-green-600 mt-3 text-center">Success!</span>}
            {error && <span className="text-red-500 mt-3 text-center">{errorMessage}</span>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
