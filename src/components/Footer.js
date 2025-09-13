import {
    Instagram,
    Twitter,
    Facebook,
    Linkedin,
    Github,
    Bot,
  } from "lucide-react";
  
  function Footer() {
    return (
      <footer className="text-gray-800 body-font bg-slate-100">
        <div className="container py-6 mx-auto flex items-center sm:flex-row flex-col">
          <a className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-xl">Study Buddy</span>
          </a>
          <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
            © 2025 Study Buddy
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <a className="text-gray-500" href="#">
              <Facebook className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-500" href="#">
              <Twitter className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-500" href="#">
              <Instagram className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-500" href="#">
              <Linkedin className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-500" href="#">
              <Github className="w-5 h-5" />
            </a>
          </span>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  