import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full flex justify-center bg-white/10 transition-all fixed bottom-0">
      <div className="w-full px-6 py-2 text-white flex justify-between items-center transition-all duration-300 backdrop-blur-md shadow-lg z-40">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p className="text-sm">
            Made by{" "}
            <span className="text-green-500 font-bold">Rakesh Penugonda </span>{" "}
            with
            <span
              className="text-red-400 animate-pulse"
              role="img"
              aria-label="love"
            >
              ❤️
            </span>{" "}
            and{" "}
            <span role="img" aria-label="laptop">
              💻
            </span>
          </p>
          <p className="text-sm mt-2 text-gray-400"></p>
        </div>
        <div className="flex justify-center space-x-6">
          <p>&copy; {new Date().getFullYear()} NeoCode</p>
          <a
            href="https://github.com/Rakesh-116"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="GitHub"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/rakesh-penugonda/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
