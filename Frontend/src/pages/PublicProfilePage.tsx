import { useParams, Navigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return <ProfilePage viewMode="public" username={username} />;
}
