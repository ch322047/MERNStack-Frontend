import PageTitle from '../components/PageTitle';
import { useState, useEffect } from "react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`/api/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return (
    <div>
      <PageTitle />
      <div id="loggedInDiv">
        {status === "loading" && (<p>Verifying your email...</p>)}
        {status === "success" && (<p>Email verified successfully. You can now log in.</p>)}
        {status !== "success" && status !== "loading" && (<p>Invalid or expired verification link.</p>)}
      </div>
    </div>
  );
  //if (status === "loading") return (<p>Verifying your email...</p>);
  //if (status === "success") return (<p>Email verified successfully. You can now log in.</p>);
  //return (<p>Invalid or expired verification link.</p>);
}
