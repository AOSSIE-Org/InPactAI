import React, { useEffect, useMemo, useState } from "react";
import { userApi, UserProfile } from "../services/userApi";
import { useAuth } from "../context/AuthContext";

const container: React.CSSProperties = {
  maxWidth: 840,
  margin: "40px auto",
  padding: 24,
  background: "rgba(26,26,26,0.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  backdropFilter: "blur(16px)",
  color: "#fff",
};

const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 };
const label: React.CSSProperties = { fontSize: 13, color: "#a0a0a0" };
const inputBase: React.CSSProperties = {
  background: "#121212",
  border: "1px solid #2a2a2a",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 12px",
};
const actions: React.CSSProperties = { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 };

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const disabled = useMemo(() => saving || loading, [saving, loading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const p = await userApi.getProfile();
        if (!mounted) return;
        setProfile(p);
        setUsername(p.username ?? "");
        setEmail(p.email ?? user?.email ?? "");
        setBio(p.bio ?? "");
        setRole((p.role ?? undefined) as string | undefined);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const onSelectImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return setImageFile(null);
    if (!f.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (f.size > 5 * 1024 * 1024) { setError("Max file size is 5MB"); return; }
    setError(null);
    setImageFile(f);
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // 1) Upload image first if any (backend returns updated profile)
      if (imageFile) {
        const updatedAfterImage = await userApi.uploadProfileImage(imageFile);
        setProfile(updatedAfterImage);
      }

      // 2) Update profile fields
      const payload: Partial<UserProfile> = {
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        // role is generally set during onboarding; do not allow arbitrary changes here unless present
        role: role as any,
        // profile_image_url already updated if image was uploaded above
      };
      const updated = await userApi.updateProfile(payload);
      setProfile(updated);
      if (updated.username) setUsername(updated.username);
      if (updated.email) setEmail(updated.email);
      if (updated.bio) setBio(updated.bio);
      if (updated.role) setRole(updated.role);
      if (updated.profile_image_url) setImageFile(null);
    } catch (e: any) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Your Profile</h1>
        {loading && <span style={{ color: "#a0a0a0", fontSize: 12 }}>Loading…</span>}
      </div>

      {error && (
        <div style={{
          marginBottom: 16,
          background: "#2a1e1e",
          border: "1px solid #5a2a2a",
          color: "#ffbdbd",
          borderRadius: 10,
          padding: 12,
          fontSize: 13,
        }}>{error}</div>
      )}

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#222", border: "1px solid #2a2a2a" }}>
          {profile?.profile_image_url ? (
            <img src={profile.profile_image_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
        </div>
        <label style={{ ...inputBase, display: "inline-block", cursor: "pointer" }}>
          <input type="file" accept="image/*" onChange={onSelectImage} style={{ display: "none" }} />
          {imageFile ? `Selected: ${imageFile.name}` : "Upload new picture"}
        </label>
      </div>

      {/* Fields */}
      <div style={field}>
        <label style={label}>Username</label>
        <input
          style={inputBase}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your display name"
          disabled={disabled}
        />
      </div>

      <div style={field}>
        <label style={label}>Email</label>
        <input style={{ ...inputBase, opacity: 0.7 }} type="email" value={email} disabled />
      </div>

      <div style={field}>
        <label style={label}>Bio</label>
        <textarea
          style={{ ...inputBase, minHeight: 100, resize: "vertical" }}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell others about you"
          disabled={disabled}
        />
      </div>

      {!!role && (
        <div style={field}>
          <label style={label}>Role</label>
          <input style={{ ...inputBase, opacity: 0.7 }} value={role} disabled />
        </div>
      )}

      <div style={actions}>
        <button
          onClick={onSave}
          disabled={disabled}
          style={{
            background: "#0B00CF",
            border: "none",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 16px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.7 : 1,
            fontWeight: 600,
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
