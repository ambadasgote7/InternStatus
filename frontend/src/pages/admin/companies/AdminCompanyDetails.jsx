import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function AdminCompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const res = await API.get(`/admin/companies/${id}`);
      setCompany(res.data?.data || null);
    } catch (err) {
      console.error("Fetch company error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading Details
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[24px] p-12 text-center shadow-sm">
          <p className="text-[#999] m-0 text-sm font-bold uppercase tracking-widest">
            Company not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans text-[#111]">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#fff] p-6 md:p-8 rounded-[24px] shadow-sm border border-[#e5e5e5] transition-all duration-300 hover:border-[#ccc]">
          <h2 className="text-[28px] md:text-3xl font-black m-0 tracking-tight text-[#111] uppercase">
            Company Details
          </h2>
          <button
            onClick={() => navigate(`/admin/companies/edit/${company._id}`)}
            className="px-8 py-3.5 text-[11px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[14px] cursor-pointer transition-all duration-300 hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 uppercase tracking-[0.15em]"
          >
            Edit Company
          </button>
        </header>

        {/* Basic Information Section */}
        <div className="bg-[#fff] p-6 md:p-8 rounded-[24px] shadow-sm border border-[#e5e5e5] transition-all duration-300 hover:border-[#ccc]">
          <h3 className="text-[12px] font-black text-[#111] mt-0 mb-6 border-b border-[#e5e5e5] pb-4 uppercase tracking-widest border-l-4 pl-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Name
              </span>
              <span className="text-[13px] font-bold text-[#111]">
                {company.name}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Status
              </span>
              <span
                className={`text-[11px] font-black tracking-widest uppercase w-max ${
                  company.status === "active"
                    ? "text-[#166534]"
                    : "text-[#991b1b]"
                }`}
              >
                {company.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Industry
              </span>
              <span className="text-[13px] font-medium text-[#111]">
                {company.industry || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Company Size
              </span>
              <span className="text-[13px] font-medium text-[#111]">
                {company.companySize || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Website
              </span>
              <span className="text-[13px] font-medium text-[#555]">
                {company.website || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5]">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Email Domain
              </span>
              <span className="text-[13px] font-medium text-[#111]">
                {company.emailDomain || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#f9f9f9] p-5 rounded-[16px] border border-[#e5e5e5] md:col-span-2">
              <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Description
              </span>
              <span className="text-[13px] font-medium text-[#555] leading-relaxed">
                {company.description || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="bg-[#fff] p-6 md:p-8 rounded-[24px] shadow-sm border border-[#e5e5e5] transition-all duration-300 hover:border-[#ccc]">
          <h3 className="text-[12px] font-black text-[#111] mt-0 mb-6 border-b border-[#e5e5e5] pb-4 uppercase tracking-widest border-l-4 pl-3">
            Locations
          </h3>

          {(!company.locations || company.locations.length === 0) && (
            <div className="px-6 py-12 text-center bg-[#f9f9f9] border border-dashed border-[#e5e5e5] rounded-[20px]">
              <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
                No locations added
              </p>
            </div>
          )}

          {company.locations && company.locations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {company.locations.map((loc, index) => (
                <div
                  key={index}
                  className="bg-[#f9f9f9] border border-[#e5e5e5] p-6 rounded-[20px] flex flex-col gap-4 transition-all hover:border-[#111]"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      City
                    </span>
                    <span className="text-[14px] font-bold text-[#111]">
                      {loc.city}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      State
                    </span>
                    <span className="text-[13px] font-medium text-[#555]">
                      {loc.state}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Country
                    </span>
                    <span className="text-[13px] font-medium text-[#555]">
                      {loc.country}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
