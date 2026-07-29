/* CBCA public configuration.
   Mailbox architecture follows the Master Handbook (Section 17.2).
   Every address must be activated, MFA-protected and CBCA-controlled before public use. */
window.CBCA_CONFIG = {
  orgName: "China Bangladesh Consultancy Alliance",
  orgShort: "CBCA",
  orgBangla: "চায়না বাংলাদেশ কনসালটেন্সি অ্যালায়েন্স",
  tagline: "Bangladesh’s Trusted Gateway to Chinese Education",
  website: "https://cbcabd.org",
  facebook: "https://www.facebook.com/cbca26",

  /* Section 17.2 — official mailbox architecture */
  officialEmail:     "info@cbcabd.org",
  secretariatEmail:  "secretariat@cbcabd.org",
  membershipEmail:   "membership@cbcabd.org",
  complaintsEmail:   "complaints@cbcabd.org",
  verificationEmail: "verification@cbcabd.org",
  mediaEmail:        "media@cbcabd.org",
  eventsEmail:       "events@cbcabd.org",
  itEmail:           "it@cbcabd.org",
  correctionsEmail:  "verification@cbcabd.org",

  emailStatus: "PROPOSED — confirm mailbox activation before launch",

  /* Section 10.5 — mandatory standard disclaimer, used on every public information page */
  standardDisclaimer: "CBCA publishes general information from identified sources and does not provide admission, application, document, scholarship, visa or consultancy services. Requirements and policies may change without notice. Students must verify the latest information with the responsible university, scholarship authority, Embassy or official portal before acting.",

  /* Section 7.4 — mandatory member directory disclaimer */
  memberDisclaimer: "CBCA verification reflects information reviewed as of the displayed date and is not a guarantee of admission, scholarship, visa, refund or service outcome."
};
