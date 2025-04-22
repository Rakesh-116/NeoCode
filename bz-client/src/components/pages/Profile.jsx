import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useUser } from "../../context/UserContext";
import Cookies from "js-cookie";

const Profile = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = Cookies.get("neo_code_jwt_token");
    if (!jwtToken) {
      navigate("/login");
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/95 min-h-screen">
      <Header />
      <div className="pt-28 px-12">
        <div className="flex gap-2 w-full h-[60vh]">
          <div className="w-1/3 h-full flex flex-col justify-start items-center">
            <div className="w-full">
              <div className="bg-black/70 border border-white/20 rounded-lg p-6">
                <div className="text-white">
                  <h1 className="text-2xl font-mono">{userData.username}</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="w-2/3 h-full">{/* profile content */}</div>
        </div>
        <hr className="border-b border-white/20" />
      </div>
    </div>
  );
};

export default Profile;
