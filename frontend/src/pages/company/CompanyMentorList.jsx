import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CompanyMentorList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({
    designation: "",
    department: "",
    employeeId: "",
  });
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await API.get("/company/mentors");
      setMentors(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (m) => {
    setError("");
    setSuccess("");
    setSelected(m);
    setEditForm({
      designation: m.designation || "",
      department: m.department || "",
      employeeId: m.employeeId || "",
    });
  };

  const closeEdit = () => {
    setSelected(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await API.patch(`/company/mentors/${selected._id}`, editForm);
      setSuccess("Mentor updated successfully");
      await fetchMentors();
      closeEdit();
    } catch (err) {
      console.error(err);
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (mentorId) => {
    const confirm = window.confirm("Remove this mentor from company?");
    if (!confirm) return;
    setRemovingId(mentorId);
    try {
      await API.delete(`/company/mentors/${mentorId}`);
      setMentors((prev) => prev.filter((m) => m._id !== mentorId));
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Loading Mentors...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-5">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Company Mentors
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Organizational Mentor Roster
            </p>
          </div>
        </header>

        {mentors.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No mentors found.
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Department
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      ID
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {mentors.map((m) => (
                    <tr
                      key={m._id}
                      className="hover:bg-[#f9f9f9] transition-colors duration-200"
                    >
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-bold text-[#333]">
                          {m.fullName}
                        </div>
                        <div className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-tighter">
                          {m.designation || "Mentor"}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold text-[#333] opacity-80">
                        {m.user?.email || "—"}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold text-[#333] opacity-80">
                        {m.department || "—"}
                      </td>
                      <td className="px-5 py-3 text-[12px] font-mono text-[#333] opacity-60 text-center">
                        {m.employeeId || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-3 py-1.5 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer uppercase tracking-widest"
                            onClick={() => openEdit(m)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1.5 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[10px] hover:bg-[#cc0000] hover:text-[#fff] transition-colors cursor-pointer uppercase tracking-widest disabled:opacity-50"
                            disabled={removingId === m._id}
                            onClick={() => handleRemove(m._id)}
                          >
                            {removingId === m._id ? "..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#333]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#fff] rounded-[20px] shadow-sm border border-[#e5e5e5] p-6 box-border flex flex-col gap-5 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#f9f9f9] pb-3">
              <h3 className="text-[18px] font-black text-[#333] m-0 tracking-tight">
                Edit Mentor
              </h3>
              <button
                onClick={closeEdit}
                className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest bg-transparent border-none cursor-pointer hover:opacity-100 p-0"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
              {error && (
                <div className="px-3 py-2 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[8px] uppercase tracking-widest">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-3 py-2 text-[11px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[8px] uppercase tracking-widest">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Department
                </label>
                <input
                  name="department"
                  value={editForm.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Designation
                </label>
                <input
                  name="designation"
                  value={editForm.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Developer"
                  className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Employee ID
                </label>
                <input
                  name="employeeId"
                  value={editForm.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP12345"
                  className="w-full px-4 py-2.5 text-[13px] font-mono text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#f9f9f9]">
              <button
                onClick={closeEdit}
                className="px-5 py-2 text-[12px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors cursor-pointer uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-6 py-2 text-[12px] font-bold text-[#fff] bg-[#111] border-none rounded-[12px] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer uppercase tracking-widest"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
