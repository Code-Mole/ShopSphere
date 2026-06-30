import { useState } from "react";

/**
 * Generic form state manager.
 * Handles values, errors, loading, and submission.
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setAlert({ type: "", message: "" });
  };

  return {
    values,
    errors,
    loading,
    alert,
    setLoading,
    setAlert,
    setErrors,
    handleChange,
    setFieldError,
    reset,
  };
}
