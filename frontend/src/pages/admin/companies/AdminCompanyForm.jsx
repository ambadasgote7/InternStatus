import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../api/api";
import AdminNavBar from "../../../components/navbars/AdminNavBar";

export default function AdminCompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    website: "",
    emailDomain: "",
    industry: "",
    companySize: "",
    description: "",
    locations: [],
  });

  const fetchCompany = async () => {
    try {
      const res = await API.get(`/admin/companies/${id}`);
      setForm(res.data?.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load company");
    }
  };

  useEffect(() => {
    if (isEdit) fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addLocation = () => {
    setForm({
      ...form,
      locations: [...form.locations, { city: "", state: "", country: "" }],
    });
  };

  const updateLocation = (index, field, value) => {
    const updated = [...form.locations];
    updated[index][field] = value;
    setForm({
      ...form,
      locations: updated,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await API.put(`/admin/companies/${id}`, form);
      } else {
        await API.post(`/admin/companies`, form);
      }
      navigate("/admin/companies");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans">
      <AdminNavBar />

      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-8 rounded-[20px] shadow-sm">
          <header className="mb-8 border-b border-[#e5e5e5] pb-4">
            <h2 className="text-[23px] font-black m-0 tracking-tight text-[#333]">
              {isEdit ? "Edit Company Profile" : "Add New Company"}
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[13px] font-bold text-[#333]">
                    Company Name
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. Acme Corporation"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#333]">
                    Industry
                  </label>
                  <input
                    name="industry"
                    placeholder="e.g. Software, Finance"
                    value={form.industry || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#333]">
                    Company Size
                  </label>
                  <input
                    name="companySize"
                    placeholder="e.g. 50-200, 1000+"
                    value={form.companySize || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#333]">
                    Email Domain
                  </label>
                  <input
                    name="emailDomain"
                    placeholder="e.g. acmecorp.com"
                    value={form.emailDomain || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#333]">
                    Website
                  </label>
                  <input
                    name="website"
                    placeholder="e.g. https://www.acmecorp.com"
                    value={form.website || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[13px] font-bold text-[#333]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Brief overview of the company"
                    value={form.description || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-[#e5e5e5]">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest">
                  Locations
                </h3>
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] hover:bg-[#e5e5e5] transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Add Location
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {form.locations.length === 0 && (
                  <div className="p-8 text-center bg-[#f9f9f9] border border-dashed border-[#e5e5e5] rounded-[20px]">
                    <p className="text-[13px] font-bold text-[#333] opacity-40 m-0">
                      No locations added yet.
                    </p>
                  </div>
                )}

                {form.locations.map((loc, index) => (
                  <div
                    key={index}
                    className="bg-[#fff] border border-[#e5e5e5] p-5 rounded-[20px] grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                        City
                      </label>
                      <input
                        placeholder="e.g. Pune"
                        value={loc.city}
                        onChange={(e) =>
                          updateLocation(index, "city", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                        State
                      </label>
                      <input
                        placeholder="e.g. Maharashtra"
                        value={loc.state}
                        onChange={(e) =>
                          updateLocation(index, "state", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                        Country
                      </label>
                      <input
                        placeholder="e.g. India"
                        value={loc.country}
                        onChange={(e) =>
                          updateLocation(index, "country", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e5e5]">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-[14px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : "Save Company Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
