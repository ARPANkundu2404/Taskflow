const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-600 text-white py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <p className="text-sm text-center md:text-left">
          © {currentYear} <span className="font-semibold">TaskFlow V3</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
