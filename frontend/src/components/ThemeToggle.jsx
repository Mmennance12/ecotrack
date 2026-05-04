import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 ${className}`}
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a.75.75 0 0 0-.71 1.02A7 7 0 0 0 20 15.21a.75.75 0 0 0 1.02-.71Z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 17.25a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Zm0-13.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm0 16.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm8.25-8.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75ZM5.25 12a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75Zm11.72-5.97a.75.75 0 0 1 0-1.06l.36-.36a.75.75 0 1 1 1.06 1.06l-.36.36a.75.75 0 0 1-1.06 0Zm-9.94 9.94a.75.75 0 0 1 0-1.06l.36-.36a.75.75 0 1 1 1.06 1.06l-.36.36a.75.75 0 0 1-1.06 0Zm10.3 1.06a.75.75 0 0 1 1.06 0l.36.36a.75.75 0 1 1-1.06 1.06l-.36-.36a.75.75 0 0 1 0-1.06ZM6.03 6.03a.75.75 0 0 1 1.06 0l.36.36a.75.75 0 1 1-1.06 1.06l-.36-.36a.75.75 0 0 1 0-1.06Z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
