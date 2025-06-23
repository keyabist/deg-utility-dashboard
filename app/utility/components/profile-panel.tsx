import React, { useState } from "react";

export function ProfilePanel() {
  // Initial user data (could be props or fetched in a real app)
  const [profile, setProfile] = useState({
    name: "John Smith",
    role: "Senior Grid Operator",
    email: "john.smith@utility.com",
    lastLogin: "Today, 9:45 AM",
    title: "Grid Operator",
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(form);
    setEditMode(false);
  };

  const handleCancel = () => {
    setForm(profile);
    setEditMode(false);
  };

  return (
    <div className="max-w-md mx-auto bg-[#1E293B] rounded-2xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold" style={{ aspectRatio: '1 / 1', borderRadius: '50%' }}>
          {profile.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          {editMode ? (
            <>
              <input
                className="text-lg font-semibold bg-[#232B3E] border border-blue-400 rounded-lg px-2 py-1 text-white mb-1 w-full"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                className="text-sm text-blue-300 bg-[#232B3E] border border-blue-400 rounded-lg px-2 py-1 text-white w-full"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <div className="text-lg font-semibold">{profile.name}</div>
              <div className="text-sm text-blue-300">{profile.title}</div>
            </>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="text-xs text-blue-200 mb-1">Email ID</div>
        {editMode ? (
          <input
            className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base text-white w-full"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        ) : (
          <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">{profile.email}</div>
        )}
      </div>
      <div className="mb-4">
        <div className="text-xs text-blue-200 mb-1">Role</div>
        {editMode ? (
          <input
            className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base text-white w-full"
            name="role"
            value={form.role}
            onChange={handleChange}
          />
        ) : (
          <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">{profile.role}</div>
        )}
      </div>
      <div className="mb-4">
        <div className="text-xs text-blue-200 mb-1">Last Login</div>
        <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">{profile.lastLogin}</div>
      </div>
      {editMode ? (
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white font-semibold"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
} 