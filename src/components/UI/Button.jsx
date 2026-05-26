const Button = ({
  onClick,
  disabled = false,
  className = "",
  type = "button",
  title,
  loading = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full py-2 rounded-xl bg-black text-white
        transition cursor-pointer
        ${isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:opacity-90"}
        ${className}
      `}
    >
      {loading ? "Loading..." : title}
    </button>
  );
};

export default Button;