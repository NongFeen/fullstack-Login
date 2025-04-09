import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ allowedRoles, children }) {
  const [status, setStatus] = useState({ loading: true, authorized: false });

  useEffect(() => {
    axios
      .get("https://feenfeenfeen.online/api/auth/me", {
        withCredentials: true,
      })
      .then((res) => {
        if (allowedRoles.includes(res.data.role)) {
          setStatus({ loading: false, authorized: true });
        } else {
          setStatus({ loading: false, authorized: false });
        }
      })
      .catch(() => {
        setStatus({ loading: false, authorized: false });
      });
  }, [allowedRoles]);

  if (status.loading) return <div>Loading...</div>;

  return status.authorized ? children : <Navigate to="/dashboard" replace />;
}

export default ProtectedRoute;
