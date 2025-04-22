import { useNavigate } from "react-router-dom";
import zoro from "../../assets/zoro-s.png";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="h-screen bg-black/95 text-white w-full flex flex-col justify-center items-center font-semibold font-mono">
        <img src={zoro} className="w-[400px]" />
        <h1 className="text-4xl mb-4">404 Error</h1>
        <h1>Don't lose your way, Buddy!!</h1>
        <button
          onClick={() => navigate("/")}
          className="my-4 bg-orange-400 rounded-xl px-4 py-2"
        >
          Back to Home Page
        </button>
      </div>
    </>
  );
};

export default NotFound;
