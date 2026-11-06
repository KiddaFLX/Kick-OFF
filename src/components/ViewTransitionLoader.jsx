export const ViewTransitionLoader = ({ children, viewKey }) => {
  return <div
    key={viewKey}
    className="view-fade-in"
    style={{
      width: "100%",
      animation: "viewFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards"
    }}
  >
      {children}
    </div>;
};
