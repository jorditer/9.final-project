import { FormEvent, useState, FC } from "react";
import createChangeHandler from "../utils/form";
import axios from "axios";
import User from "../interfaces/User";
import { useNavigate } from "react-router";

interface LoginProps {
  setThisUser: (user: string | null) => void;
}

const Login: FC<LoginProps> = ({ setThisUser }) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
  });

  const myStorage = window.localStorage
  const navigate = useNavigate();
  const handleChange = createChangeHandler(setNewUser);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(newUser);
    try {
      const res = await axios.post("/api/users/login", newUser);
      myStorage.setItem("user", res.data.username);

      console.log(res.data.username);
			if (res.status === 201 || res.status === 200) {
				setThisUser(res.data.username);
				setError(false);
				setSuccess(true);
        navigate('/');
			}
    } catch (err) {
			setError(true)
    }
  };
  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-yellow-950 bg-opacity-70" />

      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 p-2 -translate-x-1/2 -translate-y-1/2  bg-white w-2/3 sm:w-1/2 md:w-4/12">
        <div className="logo p-4 text-base">
          <h1 className="text-4xl pb-2 font-bold">Log in</h1>
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
            {error && <span className="text-red-500 mt-3 text-center">Something failed...</span>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
