import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "../components/NavBar";

export default function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    if (user?.role) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [user, navigate]);

  return (
    <>
      <NavBar />

      <div className="font-nunito bg-[#f8fafc] text-[#111]">

        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">

          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-widest text-gray-500 mb-4 uppercase">
              Built for Students • Colleges • Companies
            </p>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              From Internship Search <br />
              to <span className="text-blue-600">Completion</span>
            </h1>

            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Apply, hire, mentor, and complete internships — all in one seamless
              flow. No spreadsheets. No confusion. Just outcomes.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:scale-105 transition"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/college/register")}
                className="px-8 py-3 rounded-xl border border-gray-300 bg-white font-semibold hover:bg-gray-100 transition"
              >
                For Colleges
              </button>

              <button
                onClick={() => navigate("/company/register")}
                className="px-8 py-3 rounded-xl border border-gray-300 bg-white font-semibold hover:bg-gray-100 transition"
              >
                For Companies
              </button>
            </div>
          </div>
        </section>

        {/* VALUE SECTION */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3">
              Built Around Outcomes, Not Tools
            </h2>
            <p className="text-gray-500">
              Everything is connected — nothing feels fragmented.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">Get Placed Faster</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover internships, apply instantly, and always know your
                status — no more guessing or chasing updates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">Hire Without Chaos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Review applicants, assign mentors, and onboard interns in a
                structured, clean workflow.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">One Continuous Flow</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From application to completion, every step is connected — no
                switching tools, no broken processes.
              </p>
            </div>

          </div>
        </section>

        {/* FLOW SECTION */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto text-center mb-14">
            <h2 className="text-4xl font-bold mb-3">
              A Complete Internship Lifecycle
            </h2>
            <p className="text-gray-500">
              Not separate features — one continuous experience.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">

            <div>
              <div className="text-blue-600 font-bold text-lg mb-2">01</div>
              <h4 className="font-semibold mb-2">Discover</h4>
              <p className="text-sm text-gray-500">
                Students explore relevant internship opportunities.
              </p>
            </div>

            <div>
              <div className="text-blue-600 font-bold text-lg mb-2">02</div>
              <h4 className="font-semibold mb-2">Apply</h4>
              <p className="text-sm text-gray-500">
                Applications are submitted and tracked in real-time.
              </p>
            </div>

            <div>
              <div className="text-blue-600 font-bold text-lg mb-2">03</div>
              <h4 className="font-semibold mb-2">Work</h4>
              <p className="text-sm text-gray-500">
                Mentors guide interns while progress is continuously tracked.
              </p>
            </div>

            <div>
              <div className="text-blue-600 font-bold text-lg mb-2">04</div>
              <h4 className="font-semibold mb-2">Complete</h4>
              <p className="text-sm text-gray-500">
                Performance is evaluated and credits are assigned.
              </p>
            </div>

          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-6 text-center bg-blue-600 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Stop Managing. Start Delivering Outcomes.
          </h2>

          <p className="mb-8 text-blue-100">
            One platform to run internships end-to-end — without friction.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:scale-105 transition"
          >
            Enter Platform
          </button>
        </section>

      </div>
    </>
  );
}