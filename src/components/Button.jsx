export function Button1({ children, onClick, type = "button",}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="button1"
        >
            {children}
        </button>
    );
}