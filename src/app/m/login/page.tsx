"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useMobileStore } from "@/lib/mobile/store";
import { MOBILE_ACCOUNTS, MOBILE_CREDENTIALS } from "@/lib/mobile/mock-data";
import { useMobileT } from "@/lib/mobile/i18n";

export default function LoginPage() {
  const { connexion } = useMobileStore();
  const { t } = useMobileT();
  const router = useRouter();
  const [matricule, setMatricule] = useState("");
  const [code, setCode] = useState("");
  const [enCours, setEnCours] = useState(false);

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const r = connexion(matricule, code);
    if (!r.ok) {
      setEnCours(false);
      toast.error(t(r.erreur));
      return;
    }
    router.replace("/m");
  };

  const remplir = (m: string) => {
    setMatricule(m);
    setCode(MOBILE_CREDENTIALS[m].code);
  };

  return (
    <div className="m-scroll m-safe-top px-5 pt-10">
      <div
        aria-hidden
        className="w-16 h-16 grid place-items-center rounded-2xl text-white font-grotesk font-bold text-4xl shadow-lg shadow-red-600/30"
        style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
      >
        L
      </div>

      <h1 className="mt-7 mb-0 text-3xl font-bold text-gray-900 dark:text-white leading-tight">
        {t("login_l1")}
        <br />
        <span className="text-gray-400 dark:text-gray-400">{t("login_l2")}</span>
      </h1>
      <p className="mt-3 mb-0 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t("login_desc")}
      </p>

      <form onSubmit={soumettre} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="matricule"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"
          >
            {t("login_matricule")}
          </label>
          <input
            id="matricule"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-base placeholder:text-gray-400 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
            placeholder="REC-0000"
            autoComplete="username"
            autoCapitalize="characters"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"
          >
            {t("login_code")}
          </label>
          <input
            id="code"
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="m-num w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-lg tracking-[0.4em] placeholder:text-gray-400 placeholder:tracking-normal focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
            placeholder="••••"
            autoComplete="current-password"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={enCours || matricule.length < 3 || code.length < 4}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {t("login_submit")}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("login_demo")}
          </span>
        </div>
        <div className="space-y-2">
          {MOBILE_ACCOUNTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => remplir(a.matricule)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] hover:border-[#CC0000] transition-colors text-left"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                  {a.prenom} {a.nom}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {t(a.role === "admin" ? "role_admin" : "role_receptionniste")} · {a.site}
                </span>
              </span>
              <span className="m-num shrink-0 text-xs font-semibold text-[#CC0000]">{a.matricule}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 mb-0 text-xs leading-relaxed text-gray-400 dark:text-gray-400">
          {t("login_demoNote")}
        </p>
      </div>
    </div>
  );
}
