import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function RedirectHandler() {
  const { code } = useParams();

  useEffect(() => {
    window.location.href = `http://localhost:3000/${code}`;
  }, [code]);

  return <p>Redirecting...</p>;
}