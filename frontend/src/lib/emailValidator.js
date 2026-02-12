const DOMAIN_CORRECTIONS = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmaol.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cim": "gmail.com",
  "gmail.vom": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmails.com": "hotmail.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outllook.com": "outlook.com",
  "iclou.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icoud.com": "icloud.com",
  "icloud.con": "icloud.com",
  "aol.co": "aol.com",
  "aol.con": "aol.com",
  "comcast.ne": "comcast.net",
  "comcast.ner": "comcast.net",
  "att.ne": "att.net",
  "att.ner": "att.net",
  "protonmail.co": "protonmail.com",
  "protonmail.con": "protonmail.com",
  "live.co": "live.com",
  "live.con": "live.com",
  "msn.co": "msn.com",
  "msn.con": "msn.com",
};

export function validateEmail(email) {
  if (!email) return { valid: false, error: "Email is required" };

  const trimmed = email.trim().toLowerCase();

  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  const [local, domain] = trimmed.split("@");

  if (!local || !domain) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  const correction = DOMAIN_CORRECTIONS[domain];
  if (correction) {
    return {
      valid: false,
      suggestion: `${local}@${correction}`,
      error: `Did you mean ${local}@${correction}?`,
    };
  }

  return { valid: true, email: trimmed };
}
