import React, { useEffect, useState } from "react";
import PropTypes from "prop-types"; // ✅ Import PropTypes
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ allowedRoles, children }) {
  const [status, setStatus] = useState({ loading: true, authorized: false });

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", {
        withCredentials: true,
      })
      .then((res) => {
        if (allowedRoles.includes(res.data.role)) {
          setStatus({ loading: false, authorized: true });
        } else {
          setStatus({ loading: false, authorized: false });
        }
      })
      .catch((err) => {
        console.error("Authorization check failed", err);
        setStatus({ loading: false, authorized: false });
      });
  }, [allowedRoles]);

  if (status.loading) return <div>Loading...</div>;
  if (!status.authorized) return <Navigate to="/unauthorized" replace />;

  return children;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
