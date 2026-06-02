import React, { useEffect, useState } from "react";
import { Button, Snackbar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      window.deferredPrompt = e;
    };

    if (window.deferredPrompt) {
      setSupportsPWA(true);
      setPromptInstall(window.deferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = evt => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setSupportsPWA(false);
    });
  };

  const handleClose = () => {
    setSupportsPWA(false);
  };

  if (!supportsPWA) {
    return null;
  }

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={onClick}>
        INSTALL APP
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={supportsPWA}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message="Install this application on your device for a better experience."
      action={action}
    />
  );
}
