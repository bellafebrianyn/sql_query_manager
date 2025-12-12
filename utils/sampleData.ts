import { ProjectData } from "../types";

export const SAMPLE_DATA: ProjectData[] = [
  {
    projectName: "MTR_ACCALS (Project A)",
    rows: [
      {
        no: 1,
        deskripsi: "Mencari User untuk Login dengan kriteria: 1. Group User tertentu 2. CD_SP sesuai 3. Aktif = Y",
        jenisOperasi: "SELECT",
        namaTabel: "MTR_ACCALS.MST_USER",
        query: "SELECT * FROM MTR_ACCALS.MST_USER WHERE GROUP_USER = 'isi group user' AND CD_SP = 'isi cd sp' AND FLAG_ACTIVE = 'Y'",
        kolom: "1. ID_USER\n2. GROUP_USER",
        contohNilai: "-",
        step: "1. GROUP USER -> disesuaikan dengan tingkatan yang akan digunakan\n2. CD_SP -> disesuaikan dengan daerah cabang"
      },
      {
        no: 2,
        deskripsi: "Mencari Password dari akun User yang akan digunakan",
        jenisOperasi: "SELECT",
        namaTabel: "MTR_ACCALS.MST_USER",
        query: "SELECT ID_USER, LOGIN_DECRYPT('Key', LOGIN_PASSWORD), CD_SP, GROUP_USER, CD_DESIGN, EMAIL_ADDR FROM MTR_ACCALS.MST_USER WHERE ID_USER IN ('isi group user')",
        kolom: "1. ID_USER\n2. LOGIN_DECRYPT...",
        contohNilai: "",
        step: ""
      },
      {
        no: 3,
        deskripsi: "Kill Active Login",
        jenisOperasi: "EDIT (update)",
        namaTabel: "TRN_ACTIVE_LOGIN",
        query: "EDIT TRN_ACTIVE_LOGIN WHERE ID_USER = 'isi id user' AND FLAG_LOGIN='Y'",
        kolom: "FLAG_LOGIN",
        contohNilai: "",
        step: "Ganti kolom FLAG_LOGIN menjadi N"
      }
    ]
  },
  {
    projectName: "Finance (Project B)",
    rows: [
      {
        no: 1,
        deskripsi: "Get Monthly Revenue",
        jenisOperasi: "SELECT",
        namaTabel: "TRN_REVENUE",
        query: "SELECT SUM(AMOUNT) FROM TRN_REVENUE WHERE MONTH = '09' AND YEAR = '2024'",
        kolom: "AMOUNT",
        contohNilai: "2024, 09",
        step: "Ensure currency conversion rate is applied if CD_CURRENCY != IDR"
      }
    ]
  }
];