import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<any> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`mt-5 py-2.5 px-5 text-lg border-none bg-indigo-500 rounded text-white flex items-center justify-center ${
        loading ? "" : "cursor-pointer"
      }s`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
