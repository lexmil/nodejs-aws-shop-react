import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

// Define Snackbar context type
interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

// Create Context with default value
const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

// Hook to use Snackbar context
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

// Define Snackbar state type
interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Provider Component
interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Function to show the snackbar
  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // Function to close the snackbar
  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Listen for custom event "showSnackbarEvent"
  useEffect(() => {
    const handleEvent = (
      event: CustomEvent<{ message: string; severity: AlertColor }>
    ) => {
      showSnackbar(event.detail.message, event.detail.severity);
    };

    window.addEventListener("show-alert", handleEvent as EventListener);

    return () => {
      window.removeEventListener("show-alert", handleEvent as EventListener);
    };
  }, [showSnackbar]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
