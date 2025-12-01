import { PracticeQuestion } from './types';

export const practiceQuestions: PracticeQuestion[] = [
  // DOMAIN 1: GENERAL SECURITY CONCEPTS (Questions 1-12)
  {
    id: 1,
    domain: "1.0 General Security Concepts",
    question: "Which component of the CIA Triad is most directly impacted if an organization's payroll database is encrypted by ransomware?",
    options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
    correctAnswer: 2,
    explanation: "Ransomware denies access to data, directly affecting Availability. While the data is encrypted (confidentiality), the primary operational impact is the inability to use the system."
  },
  {
    id: 2,
    domain: "1.0 General Security Concepts",
    question: "A security analyst implements a control where users must both swipe a badge and enter a PIN to enter the server room. What type of authentication is this?",
    options: ["Single-factor", "Multifactor (Something you have + Something you know)", "Multifactor (Something you are + Something you do)", "Mutual Authentication"],
    correctAnswer: 1,
    explanation: "This is Multifactor Authentication (MFA). The badge is 'Something you have' and the PIN is 'Something you know'."
  },
  {
    id: 3,
    domain: "1.0 General Security Concepts",
    question: "Which security principle states that a user should only be given the minimum level of access necessary to perform their job functions?",
    options: ["Separation of Duties", "Least Privilege", "Defense in Depth", "Zero Trust"],
    correctAnswer: 1,
    explanation: "The Principle of Least Privilege ensures users have only the permissions required for their specific tasks, reducing the attack surface."
  },
  {
    id: 4,
    domain: "1.0 General Security Concepts",
    question: "In a Zero Trust architecture, which assumption is fundamentally rejected?",
    options: ["External threats are dangerous", "Data should be encrypted", "Internal network traffic is implicitly trusted", "Authentication is required"],
    correctAnswer: 2,
    explanation: "Zero Trust eliminates the concept of implicit trust based on network location. Even internal traffic must be authenticated and authorized."
  },
  {
    id: 5,
    domain: "1.0 General Security Concepts",
    question: "Which control category does a security awareness training program fall under?",
    options: ["Technical", "Managerial (Administrative)", "Physical", "Detective"],
    correctAnswer: 1,
    explanation: "Training is a Managerial (or Administrative) control as it addresses policies, procedures, and human behavior rather than hardware or software."
  },
  {
    id: 6,
    domain: "1.0 General Security Concepts",
    question: "What is the primary purpose of Non-Repudiation?",
    options: ["To encrypt data in transit", "To ensure a sender cannot deny sending a message", "To prevent unauthorized access", "To ensure system uptime"],
    correctAnswer: 1,
    explanation: "Non-repudiation provides proof of the origin and integrity of data, ensuring the sender cannot deny their action (often using digital signatures)."
  },
  {
    id: 7,
    domain: "1.0 General Security Concepts",
    question: "Which type of security control is a CCTV camera primarily considered?",
    options: ["Preventative", "Detective", "Corrective", "Compensating"],
    correctAnswer: 1,
    explanation: "While CCTV records evidence (detective), visibly mounted cameras act primarily as a Detective control to monitor, but can also be a Deterrent."
  },
  {
    id: 8,
    domain: "1.0 General Security Concepts",
    question: "An organization uses a gap analysis to compare current security posture against a desired framework. What is this process called?",
    options: ["Risk Acceptance", "Compliance Reporting", "Baseline comparison", "Control Selection"],
    correctAnswer: 2,
    explanation: "This compares the current state against a baseline or framework to identify gaps."
  },
  {
    id: 9,
    domain: "1.0 General Security Concepts",
    question: "Which actor type is typically motivated by social change or political agendas?",
    options: ["Script Kiddie", "Hacktivist", "Insider Threat", "Nation State"],
    correctAnswer: 1,
    explanation: "Hacktivists are motivated by ideology, politics, or social causes rather than financial gain."
  },
  {
    id: 10,
    domain: "1.0 General Security Concepts",
    question: "Which cryptographic concept ensures that a change in a single bit of the input results in a significant change to the output digest?",
    options: ["Confusion", "Diffusion", "Avalanche Effect", "Collision"],
    correctAnswer: 2,
    explanation: "The Avalanche Effect is a desirable property of hash functions where a small input change drastically changes the output."
  },
  {
    id: 11,
    domain: "1.0 General Security Concepts",
    question: "Which of the following is a physical security control?",
    options: ["Firewall", "Access Control List (ACL)", "Bollards", "Antivirus"],
    correctAnswer: 2,
    explanation: "Bollards are physical barriers used to prevent vehicles from entering secure areas."
  },
  {
    id: 12,
    domain: "1.0 General Security Concepts",
    question: "What distinguishes a 'preventative' control from a 'detective' control?",
    options: ["Preventative stops the attack; Detective identifies it happened", "Preventative is physical; Detective is digital", "Preventative restores systems; Detective stops them", "There is no difference"],
    correctAnswer: 0,
    explanation: "Preventative controls (like IPS) stop an action, while Detective controls (like logs/CCTV) record that it occurred."
  },

  // DOMAIN 2: THREATS, VULNERABILITIES, AND MITIGATIONS (Questions 13-34)
  {
    id: 13,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "An attacker sends an email appearing to be from the CEO asking for an urgent wire transfer. What type of attack is this?",
    options: ["Phishing", "Whaling", "Vishing", "Smishing"],
    correctAnswer: 1,
    explanation: "Whaling is a specific type of phishing targeting high-level executives (C-suite) or high-profile targets."
  },
  {
    id: 14,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which vulnerability exists when an application allows untrusted data to be interpreted as code, often manipulating a database?",
    options: ["Cross-Site Scripting (XSS)", "SQL Injection (SQLi)", "Buffer Overflow", "Cross-Site Request Forgery (CSRF)"],
    correctAnswer: 1,
    explanation: "SQL Injection occurs when malicious SQL statements are inserted into entry fields for execution (e.g., ' OR 1=1--)."
  },
  {
    id: 15,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which type of malware is designed to remain dormant until a specific condition is met?",
    options: ["Trojan", "Logic Bomb", "Ransomware", "Worm"],
    correctAnswer: 1,
    explanation: "A Logic Bomb executes a malicious function only when specific criteria (time, event, or condition) are met."
  },
  {
    id: 16,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What is the best mitigation against a Cross-Site Scripting (XSS) attack?",
    options: ["Input Validation and Output Encoding", "Firewall rules", "Antivirus software", "Strong passwords"],
    correctAnswer: 0,
    explanation: "Sanitizing input and encoding output prevents browsers from interpreting user-supplied data as executable scripts."
  },
  {
    id: 17,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "An attacker sits in a coffee shop and captures traffic between a user and a WiFi access point. What type of attack is this?",
    options: ["On-path (Man-in-the-Middle)", "DoS", "Bluejacking", "Tailgating"],
    correctAnswer: 0,
    explanation: "An On-path attack involves intercepting communication between two parties without their knowledge."
  },
  {
    id: 18,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which attack involves an attacker overloading a system with traffic to make it unavailable to legitimate users?",
    options: ["SQL Injection", "Distributed Denial of Service (DDoS)", "Privilege Escalation", "ARP Poisoning"],
    correctAnswer: 1,
    explanation: "DDoS attacks aim to exhaust system resources (bandwidth, CPU) to deny availability."
  },
  {
    id: 19,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "A user receives a text message claiming their bank account is locked and asking them to click a link. This is:",
    options: ["Vishing", "Phishing", "Smishing", "Spim"],
    correctAnswer: 2,
    explanation: "Smishing is phishing conducted via SMS (text messages)."
  },
  {
    id: 20,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What vulnerability is caused by a program writing more data to a block of memory than the buffer is allocated to hold?",
    options: ["Memory Leak", "Buffer Overflow", "Race Condition", "Pointer Dereference"],
    correctAnswer: 1,
    explanation: "Buffer Overflow occurs when data overruns the buffer's boundary and overwrites adjacent memory locations."
  },
  {
    id: 21,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which type of social engineering attack involves following an authorized person through a secure door?",
    options: ["Tailgating/Piggybacking", "Dumpster Diving", "Shoulder Surfing", "Impersonation"],
    correctAnswer: 0,
    explanation: "Tailgating is unauthorized entry by following someone with legitimate access."
  },
  {
    id: 22,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What does a supply chain attack target?",
    options: ["The end user directly", "The organization's vendors or software dependencies", "The physical firewall", "The email server"],
    correctAnswer: 1,
    explanation: "Supply chain attacks target less secure elements in the supply network (like a software update or vendor) to compromise the main target."
  },
  {
    id: 23,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which term describes a vulnerability that is unknown to the software vendor and has no patch available?",
    options: ["Zero-day", "Legacy vulnerability", "Known exploit", "Rootkit"],
    correctAnswer: 0,
    explanation: "A Zero-day vulnerability is one that developers have had 'zero days' to fix because it was previously unknown."
  },
  {
    id: 24,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which attack technique uses precomputed hashes to crack passwords faster?",
    options: ["Brute Force", "Dictionary Attack", "Rainbow Table", "Spray Attack"],
    correctAnswer: 2,
    explanation: "Rainbow Tables are large databases of precomputed hash chains used to reverse cryptographic hash functions."
  },
  {
    id: 25,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which mitigation is most effective against Dictionary Attacks on password logins?",
    options: ["Encryption", "Account Lockout Policies", "Hiding the username", "Using HTTP"],
    correctAnswer: 1,
    explanation: "Account lockouts prevent an attacker from making unlimited guesses against a specific account."
  },
  {
    id: 26,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What is the primary goal of a Rootkit?",
    options: ["To steal passwords", "To encrypt data", "To maintain persistent, privileged access while hiding itself", "To flood the network"],
    correctAnswer: 2,
    explanation: "Rootkits are designed to hide their existence and the existence of other malware while maintaining root/admin access."
  },
  {
    id: 27,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which web vulnerability involves an attacker forcing a user's browser to send an unauthorized request to a web application?",
    options: ["XSS", "CSRF (Cross-Site Request Forgery)", "SQLi", "SSRF"],
    correctAnswer: 1,
    explanation: "CSRF tricks the victim into submitting a malicious request using their own authenticated session."
  },
  {
    id: 28,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Modifying the MAC address of a device to impersonate another device on the network is called:",
    options: ["MAC Filtering", "MAC Cloning/Spoofing", "ARP Poisoning", "DNS Spoofing"],
    correctAnswer: 1,
    explanation: "MAC Spoofing involves changing the factory-assigned Media Access Control address of a network interface."
  },
  {
    id: 29,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which term refers to legitimate software that is used for malicious purposes (e.g., PowerShell)?",
    options: ["Living off the Land (LotL)", "Shadow IT", "Bloatware", "Firmware"],
    correctAnswer: 0,
    explanation: "LotL binaries (LOLBins) are native tools (like PowerShell, WMI) used by attackers to blend in and evade detection."
  },
  {
    id: 30,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What is 'Typosquatting'?",
    options: ["Hacking a DNS server", "Registering domains similar to popular sites (e.g., goggle.com)", "Injecting SQL code", "Guessing passwords"],
    correctAnswer: 1,
    explanation: "Typosquatting relies on users making typing errors when entering a URL."
  },
  {
    id: 31,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which indicator of compromise (IoC) suggests a beaconing malware?",
    options: ["Large file transfer at 2 AM", "Regular, periodic outbound network connections to a specific IP", "High CPU usage", "Failed login attempts"],
    correctAnswer: 1,
    explanation: "Beaconing is characterized by regular 'heartbeat' signals sent from compromised hosts to a C2 server."
  },
  {
    id: 32,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "An attacker is calling the help desk pretending to be a user who forgot their password. This is:",
    options: ["Vishing / Impersonation", "Phishing", "Dumpster Diving", "Whaling"],
    correctAnswer: 0,
    explanation: "This is a social engineering attack using voice (Vishing) and Impersonation."
  },
  {
    id: 33,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "What is the specific threat of a 'Rogue Access Point'?",
    options: ["It blocks WiFi signals", "It bypasses network security controls by allowing unauthorized wireless connections", "It encrypts data", "It speeds up the network"],
    correctAnswer: 1,
    explanation: "A rogue AP is unauthorized and can allow attackers to bypass physical security or capture traffic."
  },
  {
    id: 34,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which concept describes data remaining on media after it has been supposedly deleted?",
    options: ["Data Remanence", "Data Loss", "Data Masking", "Data Sovereignty"],
    correctAnswer: 0,
    explanation: "Data Remanence is residual data that remains after simple deletion, requiring sanitization (wiping/degaussing)."
  },

  // DOMAIN 3: SECURITY ARCHITECTURE (Questions 35-56)
  {
    id: 35,
    domain: "3.0 Security Architecture",
    question: "Which network zone is designed to host public-facing services like web servers, separating them from the internal LAN?",
    options: ["Intranet", "DMZ (Demilitarized Zone)", "VLAN", "VPN"],
    correctAnswer: 1,
    explanation: "A DMZ (Screened Subnet) exposes external services while protecting the internal network."
  },
  {
    id: 36,
    domain: "3.0 Security Architecture",
    question: "What protocol is used to securely connect to a remote server command line, replacing Telnet?",
    options: ["HTTP", "SSH (Secure Shell)", "FTP", "RDP"],
    correctAnswer: 1,
    explanation: "SSH (Port 22) provides encrypted remote terminal access, replacing the insecure Telnet."
  },
  {
    id: 37,
    domain: "3.0 Security Architecture",
    question: "Which component is responsible for managing digital certificates in a PKI environment?",
    options: ["Certificate Authority (CA)", "Key Escrow", "Web of Trust", "RAID"],
    correctAnswer: 0,
    explanation: "The Certificate Authority (CA) issues, signs, and revokes digital certificates."
  },
  {
    id: 38,
    domain: "3.0 Security Architecture",
    question: "A load balancer primarily improves which aspect of security?",
    options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
    correctAnswer: 2,
    explanation: "Load balancers distribute traffic across multiple servers, ensuring the service remains Available even if one server fails."
  },
  {
    id: 39,
    domain: "3.0 Security Architecture",
    question: "What creates a secure tunnel over an untrusted network (like the Internet)?",
    options: ["VLAN", "VPN (Virtual Private Network)", "NAT", "DNS"],
    correctAnswer: 1,
    explanation: "A VPN encapsulates and encrypts traffic to create a secure tunnel."
  },
  {
    id: 40,
    domain: "3.0 Security Architecture",
    question: "Which cloud model involves the customer managing the OS, applications, and data, while the provider manages the hardware?",
    options: ["SaaS", "PaaS", "IaaS (Infrastructure as a Service)", "FaaS"],
    correctAnswer: 2,
    explanation: "In IaaS (e.g., AWS EC2), the provider gives you the hardware/virtualization, and you manage the OS up."
  },
  {
    id: 41,
    domain: "3.0 Security Architecture",
    question: "Which tool aggregates logs from multiple sources to analyze for security threats?",
    options: ["Firewall", "SIEM (Security Information and Event Management)", "Antivirus", "VPN"],
    correctAnswer: 1,
    explanation: "SIEMs collect, correlate, and analyze log data from across the enterprise."
  },
  {
    id: 42,
    domain: "3.0 Security Architecture",
    question: "What is the purpose of an Air Gap?",
    options: ["To cool the server room", "To physically isolate a secure network from unsecured networks", "To increase WiFi range", "To backup data"],
    correctAnswer: 1,
    explanation: "An air gap physically separates a system from all other networks to ensure maximum isolation."
  },
  {
    id: 43,
    domain: "3.0 Security Architecture",
    question: "Which wireless security standard is currently considered the most secure?",
    options: ["WEP", "WPA", "WPA2", "WPA3"],
    correctAnswer: 3,
    explanation: "WPA3 is the latest standard, offering SAE (Simultaneous Authentication of Equals) and better encryption than WPA2."
  },
  {
    id: 44,
    domain: "3.0 Security Architecture",
    question: "A CASB (Cloud Access Security Broker) is used to:",
    options: ["Host websites", "Enforce security policies between on-prem users and cloud services", "Route network traffic", "Encrypt hard drives"],
    correctAnswer: 1,
    explanation: "CASBs sit between users and cloud apps to monitor activity and enforce security policies."
  },
  {
    id: 45,
    domain: "3.0 Security Architecture",
    question: "Which technology allows running multiple virtual operating systems on a single physical server?",
    options: ["Containerization", "Hypervisor", "VPN", "Proxy"],
    correctAnswer: 1,
    explanation: "A Hypervisor (Type 1 or 2) manages virtual machines (VMs)."
  },
  {
    id: 46,
    domain: "3.0 Security Architecture",
    question: "Which concept involves using a 'bait' system to lure and monitor attackers?",
    options: ["Honeytoken", "Honeypot", "Firewall", "Sandbox"],
    correctAnswer: 1,
    explanation: "A Honeypot is a decoy system designed to attract attackers to study their methods or distract them."
  },
  {
    id: 47,
    domain: "3.0 Security Architecture",
    question: "What provides a secure, tamper-resistant hardware component for storing cryptographic keys on a motherboard?",
    options: ["HSM", "TPM (Trusted Platform Module)", "BIOS", "UEFI"],
    correctAnswer: 1,
    explanation: "TPM is the chip on the motherboard; HSM is usually a dedicated external or network appliance."
  },
  {
    id: 48,
    domain: "3.0 Security Architecture",
    question: "Which port is associated with secure web traffic (HTTPS)?",
    options: ["80", "22", "443", "3389"],
    correctAnswer: 2,
    explanation: "Port 443 is the standard port for HTTPS."
  },
  {
    id: 49,
    domain: "3.0 Security Architecture",
    question: "What is the function of a Forward Proxy?",
    options: ["Protects servers from external traffic", "Filters outbound traffic from internal clients to the internet", "Balances load", "Issues certificates"],
    correctAnswer: 1,
    explanation: "A Forward Proxy acts on behalf of internal clients accessing the internet, often for filtering or caching."
  },
  {
    id: 50,
    domain: "3.0 Security Architecture",
    question: "Which access control model relies on labels (e.g., Secret, Top Secret) assigned to objects and subjects?",
    options: ["DAC (Discretionary)", "RBAC (Role-Based)", "MAC (Mandatory Access Control)", "ABAC (Attribute-Based)"],
    correctAnswer: 2,
    explanation: "MAC uses security labels and clearance levels, common in military environments."
  },
  {
    id: 51,
    domain: "3.0 Security Architecture",
    question: "Which RAID level provides mirroring (redundancy) but no performance striping?",
    options: ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
    correctAnswer: 1,
    explanation: "RAID 1 mirrors data across two disks for redundancy."
  },
  {
    id: 52,
    domain: "3.0 Security Architecture",
    question: "Which of the following is a secure alternative to FTP?",
    options: ["TFTP", "SFTP", "HTTP", "Telnet"],
    correctAnswer: 1,
    explanation: "SFTP (SSH File Transfer Protocol) encrypts data commands and transfers."
  },
  {
    id: 53,
    domain: "3.0 Security Architecture",
    question: "Implementing a jump server (jump box) is best for:",
    options: ["Public file sharing", "Securely accessing and managing devices in a segmented network", "Filtering email", "Hosting the company website"],
    correctAnswer: 1,
    explanation: "Jump servers are hardened intermediaries used to administer devices in a secure zone."
  },
  {
    id: 54,
    domain: "3.0 Security Architecture",
    question: "What is the primary security benefit of VLANs?",
    options: ["Increased bandwidth", "Logical segmentation of the network", "Encryption of data", "Virus scanning"],
    correctAnswer: 1,
    explanation: "VLANs logically separate broadcast domains, limiting the scope of attacks and controlling traffic flow."
  },
  {
    id: 55,
    domain: "3.0 Security Architecture",
    question: "Which protocol is used to secure email transmission between mail servers?",
    options: ["POP3", "IMAP", "STARTTLS / SMTPS", "SNMP"],
    correctAnswer: 2,
    explanation: "SMTPS or STARTTLS secures SMTP traffic."
  },
  {
    id: 56,
    domain: "3.0 Security Architecture",
    question: "Data Loss Prevention (DLP) systems are designed to:",
    options: ["Block viruses", "Prevent sensitive data (like SSNs) from leaving the organization", "Backup data", "Speed up downloads"],
    correctAnswer: 1,
    explanation: "DLP detects and blocks exfiltration of sensitive data based on patterns/policies."
  },

  // DOMAIN 4: SECURITY OPERATIONS (Questions 57-84)
  {
    id: 57,
    domain: "4.0 Security Operations",
    question: "In the Incident Response Lifecycle, what is the first phase?",
    options: ["Detection", "Preparation", "Containment", "Recovery"],
    correctAnswer: 1,
    explanation: "Preparation (policies, tools, training) is the first and most critical phase."
  },
  {
    id: 58,
    domain: "4.0 Security Operations",
    question: "After an incident, the team meets to discuss what went wrong and how to improve. This is called:",
    options: ["Root Cause Analysis", "Lessons Learned / Post-Incident Activity", "Containment", "Tabletop Exercise"],
    correctAnswer: 1,
    explanation: "Lessons Learned (or Post-Mortem) is the final phase to improve future response."
  },
  {
    id: 59,
    domain: "4.0 Security Operations",
    question: "Which tool is used for network mapping and port scanning?",
    options: ["Wireshark", "Nmap", "Metasploit", "Nessus"],
    correctAnswer: 1,
    explanation: "Nmap is the standard tool for scanning ports and mapping network services."
  },
  {
    id: 60,
    domain: "4.0 Security Operations",
    question: "What command in Linux would you use to change file permissions?",
    options: ["chown", "chmod", "grep", "ls"],
    correctAnswer: 1,
    explanation: "chmod (Change Mode) modifies file access permissions (read/write/execute)."
  },
  {
    id: 61,
    domain: "4.0 Security Operations",
    question: "Which Windows tool would you use to view running processes and resource usage?",
    options: ["Event Viewer", "Task Manager", "Device Manager", "Registry Editor"],
    correctAnswer: 1,
    explanation: "Task Manager displays active processes and performance metrics."
  },
  {
    id: 62,
    domain: "4.0 Security Operations",
    question: "A firewall rule that denies all traffic not explicitly allowed is known as:",
    options: ["Implicit Deny", "Explicit Allow", "Stateful Inspection", "Port Forwarding"],
    correctAnswer: 0,
    explanation: "Implicit Deny ensures that if traffic doesn't match a rule, it is blocked by default."
  },
  {
    id: 63,
    domain: "4.0 Security Operations",
    question: "Which activity involves searching through data logs to find indicators of potential threats that automated systems missed?",
    options: ["Threat Hunting", "Vulnerability Scanning", "Penetration Testing", "Patching"],
    correctAnswer: 0,
    explanation: "Threat Hunting is the proactive, human-driven search for threats."
  },
  {
    id: 64,
    domain: "4.0 Security Operations",
    question: "During an incident, isolating a compromised server from the network represents which phase?",
    options: ["Identification", "Containment", "Eradication", "Recovery"],
    correctAnswer: 1,
    explanation: "Containment prevents the spread of the incident (e.g., unplugging the network cable)."
  },
  {
    id: 65,
    domain: "4.0 Security Operations",
    question: "Which log source would best help identify a brute-force login attempt?",
    options: ["Firewall logs", "Authentication/Security logs", "Performance logs", "DNS logs"],
    correctAnswer: 1,
    explanation: "Authentication logs record success/failure of login attempts."
  },
  {
    id: 66,
    domain: "4.0 Security Operations",
    question: "What is the primary difference between a Vulnerability Scan and a Penetration Test?",
    options: ["Scans are manual; Pen tests are automated", "Scans identify weaknesses; Pen tests exploit them", "They are the same", "Scans are more expensive"],
    correctAnswer: 1,
    explanation: "Vulnerability scans passively identify flaws; Penetration tests actively exploit them to prove risk."
  },
  {
    id: 67,
    domain: "4.0 Security Operations",
    question: "Using the `ping` command helps determine:",
    options: ["Port status", "Service version", "Connectivity/Reachability", "Password strength"],
    correctAnswer: 2,
    explanation: "Ping checks if a remote host is reachable via ICMP."
  },
  {
    id: 68,
    domain: "4.0 Security Operations",
    question: "Which Linux command searches for text patterns within files?",
    options: ["ls", "cat", "grep", "touch"],
    correctAnswer: 2,
    explanation: "grep (Global Regular Expression Print) searches text."
  },
  {
    id: 69,
    domain: "4.0 Security Operations",
    question: "Which recovery site type is fully operational and can take over immediately?",
    options: ["Cold Site", "Warm Site", "Hot Site", "Mobile Site"],
    correctAnswer: 2,
    explanation: "A Hot Site is fully equipped and mirrored, allowing near-instant failover."
  },
  {
    id: 70,
    domain: "4.0 Security Operations",
    question: "What does 'Chain of Custody' ensure during a forensic investigation?",
    options: ["Data is encrypted", "Evidence is tracked and handling is documented to be admissible in court", "The suspect is arrested", "The hard drive is wiped"],
    correctAnswer: 1,
    explanation: "Chain of Custody documents who handled evidence, when, and why, preserving its legal integrity."
  },
  {
    id: 71,
    domain: "4.0 Security Operations",
    question: "Which of the following is an example of a detective control?",
    options: ["Bollard", "Motion Sensor alarm", "Firewall", "Smart card"],
    correctAnswer: 1,
    explanation: "Motion sensors detect and alert on presence; they don't physically stop it."
  },
  {
    id: 72,
    domain: "4.0 Security Operations",
    question: "In a firewall, what does 'Stateful' inspection mean?",
    options: ["It checks only the packet header", "It tracks the state of active connections and allows return traffic", "It blocks everything", "It is slower"],
    correctAnswer: 1,
    explanation: "Stateful firewalls remember active connections and automatically allow response traffic."
  },
  {
    id: 73,
    domain: "4.0 Security Operations",
    question: "Which Windows command displays current TCP/IP network configuration?",
    options: ["ifconfig", "ipconfig", "ping", "netstat"],
    correctAnswer: 1,
    explanation: "ipconfig shows IP address, subnet mask, and gateway on Windows (ifconfig is Linux)."
  },
  {
    id: 74,
    domain: "4.0 Security Operations",
    question: "What is the purpose of 'Sanitization' in data lifecycle management?",
    options: ["Compressing data", "Encrypting data", "Removing sensitive data so media can be reused/discarded", "Backing up data"],
    correctAnswer: 2,
    explanation: "Sanitization (e.g., wiping) ensures data cannot be recovered from media."
  },
  {
    id: 75,
    domain: "4.0 Security Operations",
    question: "Which backup type backs up all changes since the last *Full* backup?",
    options: ["Incremental", "Differential", "Snapshot", "Full"],
    correctAnswer: 1,
    explanation: "Differential backups capture changes since the last Full. Incremental captures changes since the last backup of *any* type."
  },
  {
    id: 76,
    domain: "4.0 Security Operations",
    question: "What tool is primarily used for packet capture and analysis (sniffing)?",
    options: ["Nmap", "Wireshark", "Netcat", "John the Ripper"],
    correctAnswer: 1,
    explanation: "Wireshark is the industry standard for analyzing network packets."
  },
  {
    id: 77,
    domain: "4.0 Security Operations",
    question: "During which IR phase are systems restored to normal operation and vulnerabilities patched?",
    options: ["Containment", "Eradication", "Recovery", "Detection"],
    correctAnswer: 2,
    explanation: "Recovery involves restoring systems and validating they are clean and functional."
  },
  {
    id: 78,
    domain: "4.0 Security Operations",
    question: "Which SOC role is typically responsible for the initial triage of security alerts?",
    options: ["Tier 1 Analyst", "Tier 3 Threat Hunter", "CISO", "Compliance Officer"],
    correctAnswer: 0,
    explanation: "Tier 1 analysts handle the initial review and triage of incoming alerts."
  },
  {
    id: 79,
    domain: "4.0 Security Operations",
    question: "What is the 'Order of Volatility' used for?",
    options: ["Deciding which data to collect first in forensics (most fleeting to least)", "Sorting emails", "Prioritizing patches", "Ordering firewall rules"],
    correctAnswer: 0,
    explanation: "Forensics requires capturing volatile data (RAM, cache) before it is lost (e.g., by powering down)."
  },
  {
    id: 80,
    domain: "4.0 Security Operations",
    question: "What is a 'Tabletop Exercise'?",
    options: ["A physical stress test", "Discussion-based simulation of an emergency scenario", "Penetration test", "Installing new desks"],
    correctAnswer: 1,
    explanation: "Tabletop exercises are discussion-based sessions to walk through response plans without touching live systems."
  },
  {
    id: 81,
    domain: "4.0 Security Operations",
    question: "Which command displays active network connections and listening ports?",
    options: ["ping", "traceroute", "netstat", "dig"],
    correctAnswer: 2,
    explanation: "netstat shows network statistics, active connections, and ports."
  },
  {
    id: 82,
    domain: "4.0 Security Operations",
    question: "A 'False Positive' in a SIEM means:",
    options: ["An attack happened and was alerted", "An attack happened and was missed", "No attack happened, but an alert was generated", "The system is broken"],
    correctAnswer: 2,
    explanation: "False Positive = Alarm sounded, but no fire."
  },
  {
    id: 83,
    domain: "4.0 Security Operations",
    question: "Using `dig` or `nslookup` is primarily for troubleshooting:",
    options: ["DHCP", "DNS", "HTTP", "FTP"],
    correctAnswer: 1,
    explanation: "These tools query DNS nameservers."
  },
  {
    id: 84,
    domain: "4.0 Security Operations",
    question: "Which mitigation strategy reduces the risk of data loss on a lost laptop?",
    options: ["Full Disk Encryption (FDE)", "Screen locks", "Anti-malware", "Firewall"],
    correctAnswer: 0,
    explanation: "FDE protects data at rest even if the physical device is stolen."
  },

  // DOMAIN 5: SECURITY PROGRAM MANAGEMENT (Questions 85-100)
  {
    id: 85,
    domain: "5.0 Security Program Management",
    question: "Which document defines the acceptable use of company resources by employees?",
    options: ["SLA", "AUP (Acceptable Use Policy)", "NDA", "MOU"],
    correctAnswer: 1,
    explanation: "The AUP outlines rules for using company computers, networks, and internet."
  },
  {
    id: 86,
    domain: "5.0 Security Program Management",
    question: "What is the formula for ALE (Annual Loss Expectancy)?",
    options: ["SLE × ARO", "Asset Value × EF", "SLE / ARO", "Impact + Likelihood"],
    correctAnswer: 0,
    explanation: "ALE = Single Loss Expectancy (SLE) × Annual Rate of Occurrence (ARO)."
  },
  {
    id: 87,
    domain: "5.0 Security Program Management",
    question: "A company purchases insurance to cover the cost of a data breach. This is an example of risk:",
    options: ["Avoidance", "Mitigation", "Transfer (Sharing)", "Acceptance"],
    correctAnswer: 2,
    explanation: "Insurance transfers the financial risk to a third party."
  },
  {
    id: 88,
    domain: "5.0 Security Program Management",
    question: "Which officer is primarily responsible for the organization's data privacy compliance (e.g., GDPR)?",
    options: ["CISO", "DPO (Data Protection Officer)", "CIO", "CEO"],
    correctAnswer: 1,
    explanation: "The DPO ensures compliance with privacy laws and regulations."
  },
  {
    id: 89,
    domain: "5.0 Security Program Management",
    question: "What does MTTR stand for?",
    options: ["Mean Time To Repair/Restore", "Max Time To Recover", "Mean Time To Risk", "Minimum Time To Respond"],
    correctAnswer: 0,
    explanation: "MTTR measures the average time required to fix a failed component or restore a service."
  },
  {
    id: 90,
    domain: "5.0 Security Program Management",
    question: "Which third-party risk management document specifies the service levels (uptime, support) expected from a vendor?",
    options: ["NDA", "BPA", "SLA (Service Level Agreement)", "ISA"],
    correctAnswer: 2,
    explanation: "An SLA defines specific metrics (like 99.9% uptime) the vendor must meet."
  },
  {
    id: 91,
    domain: "5.0 Security Program Management",
    question: "What is the RPO (Recovery Point Objective)?",
    options: ["How long it takes to restore", "The max acceptable data loss (measured in time)", "The cost of the disaster", "The time to notify users"],
    correctAnswer: 1,
    explanation: "RPO defines how much data loss is acceptable (e.g., 'we can lose up to 1 hour of data')."
  },
  {
    id: 92,
    domain: "5.0 Security Program Management",
    question: "Which regulatory standard applies to credit card processing security?",
    options: ["HIPAA", "GDPR", "PCI DSS", "SOX"],
    correctAnswer: 2,
    explanation: "PCI DSS (Payment Card Industry Data Security Standard) governs credit card data protection."
  },
  {
    id: 93,
    domain: "5.0 Security Program Management",
    question: "Performing a background check on new hires is which type of control?",
    options: ["Technical", "Administrative/Managerial", "Physical", "Corrective"],
    correctAnswer: 1,
    explanation: "It is an administrative personnel security control."
  },
  {
    id: 94,
    domain: "5.0 Security Program Management",
    question: "What distinguishes Qualitative Risk Assessment from Quantitative?",
    options: ["Quantitative uses numbers ($); Qualitative uses categories (High/Med/Low)", "Quantitative is subjective", "Qualitative uses formulas", "There is no difference"],
    correctAnswer: 0,
    explanation: "Quantitative is numerical/financial; Qualitative is subjective/categorical."
  },
  {
    id: 95,
    domain: "5.0 Security Program Management",
    question: "A change management board (CAB) is primarily used to:",
    options: ["Approve budget", "Review and approve proposed changes to IT systems to minimize risk", "Hire staff", "Conduct forensics"],
    correctAnswer: 1,
    explanation: "The CAB ensures changes are tested, documented, and authorized to prevent outages."
  },
  {
    id: 96,
    domain: "5.0 Security Program Management",
    question: "Which plan focuses specifically on keeping critical business functions running during a disaster?",
    options: ["BCP (Business Continuity Plan)", "DRP (Disaster Recovery Plan)", "IRP (Incident Response Plan)", "AUP"],
    correctAnswer: 0,
    explanation: "BCP focuses on business operations; DRP focuses on IT infrastructure recovery."
  },
  {
    id: 97,
    domain: "5.0 Security Program Management",
    question: "Data Classification (e.g., Public, Confidential, Restricted) is mainly done to:",
    options: ["Organize files", "Apply appropriate security controls based on value/sensitivity", "Delete data", "Speed up access"],
    correctAnswer: 1,
    explanation: "Classification determines the level of protection data requires."
  },
  {
    id: 98,
    domain: "5.0 Security Program Management",
    question: "A Non-Disclosure Agreement (NDA) is a legal contract that:",
    options: ["Guarantees a job", "Protects confidential information from being shared", "Defines uptime", "Allows hacking"],
    correctAnswer: 1,
    explanation: "NDAs legally bind parties to secrecy regarding shared confidential info."
  },
  {
    id: 99,
    domain: "5.0 Security Program Management",
    question: "Which concept ensures that no single person has complete control over a critical function?",
    options: ["Least Privilege", "Separation of Duties", "Job Rotation", "Mandatory Vacation"],
    correctAnswer: 1,
    explanation: "Separation of Duties splits critical tasks (e.g., approving and issuing checks) to prevent fraud."
  },
  {
    id: 100,
    domain: "5.0 Security Program Management",
    question: "What is the purpose of a 'Business Impact Analysis' (BIA)?",
    options: ["To test firewalls", "To identify critical functions and the impact of their downtime", "To train employees", "To audit passwords"],
    correctAnswer: 1,
    explanation: "BIA identifies critical business processes and the effects (financial, operational) if they fail."
  },
  
  // NEW ADDITIONS FOR SY0-701 (IDs 101-120)
  {
    id: 101,
    domain: "1.0 General Security Concepts",
    question: "In a Zero Trust model, separating the function that directs traffic from the function that forwards traffic is known as:",
    options: ["Control Plane / Data Plane Separation", "Air Gapping", "VLAN Segmentation", "Micro-segmentation"],
    correctAnswer: 0,
    explanation: "Zero Trust architecture emphasizes separating the Control Plane (decision making) from the Data Plane (actual data transfer) to improve security."
  },
  {
    id: 102,
    domain: "1.0 General Security Concepts",
    question: "A 'Warning: Access Restricted' login banner is an example of which type of control?",
    options: ["Preventative", "Deterrent", "Compensating", "Corrective"],
    correctAnswer: 1,
    explanation: "Login banners act as a Deterrent by warning potential attackers of legal consequences and monitoring."
  },
  {
    id: 103,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "An attacker manipulates the training data of a machine learning model to cause it to misclassify malicious inputs. This is:",
    options: ["Data Poisoning", "Model Inversion", "Cryptojacking", "Bluejacking"],
    correctAnswer: 0,
    explanation: "Data Poisoning involves corrupting the training dataset to compromise the integrity or availability of an AI/ML model."
  },
  {
    id: 104,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "Which attack involves forcing a client and server to abandon a secure encrypted connection in favor of an older, insecure protocol?",
    options: ["Replay Attack", "Downgrade Attack", "Side-channel Attack", "Brute Force"],
    correctAnswer: 1,
    explanation: "A Downgrade Attack (like SSL Stripping) forces the system to fall back to a weaker or unencrypted protocol."
  },
  {
    id: 105,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "A vulnerability where the state of a resource changes between the time it is checked and the time it is used is called:",
    options: ["Buffer Overflow", "Race Condition (TOCTOU)", "Memory Leak", "Integer Overflow"],
    correctAnswer: 1,
    explanation: "Time-of-Check to Time-of-Use (TOCTOU) is a race condition where a security check is bypassed because the resource changed in the interim."
  },
  {
    id: 106,
    domain: "3.0 Security Architecture",
    question: "Which cloud architecture model converges wide area networking (WAN) with network security services like CASB, FWaaS, and SWG?",
    options: ["SASE (Secure Access Service Edge)", "SD-WAN", "VPN", "MPLS"],
    correctAnswer: 0,
    explanation: "SASE (Secure Access Service Edge) combines networking and security functions into a unified, cloud-delivered service."
  },
  {
    id: 107,
    domain: "3.0 Security Architecture",
    question: "Which component is deployed in front of an API to enforce rate limiting, authentication, and logging?",
    options: ["API Gateway", "Load Balancer", "Switch", "Forward Proxy"],
    correctAnswer: 0,
    explanation: "An API Gateway manages and secures API traffic, handling tasks like throttling, auth, and monitoring."
  },
  {
    id: 108,
    domain: "3.0 Security Architecture",
    question: "Managing infrastructure using definition files (e.g., Terraform, Ansible) rather than manual configuration is known as:",
    options: ["Infrastructure as Code (IaC)", "Software Defined Networking", "Containerization", "Patch Management"],
    correctAnswer: 0,
    explanation: "IaC allows infrastructure to be provisioned and managed using code, improving consistency and version control."
  },
  {
    id: 109,
    domain: "3.0 Security Architecture",
    question: "Which technology packages an application and its dependencies into a isolated unit that shares the host OS kernel?",
    options: ["Virtual Machine", "Container", "Hypervisor", "Thin Client"],
    correctAnswer: 1,
    explanation: "Containers (like Docker) are lightweight execution environments that share the host kernel but isolate the application."
  },
  {
    id: 110,
    domain: "4.0 Security Operations",
    question: "Which tool category automatically ingests security alerts and triggers automated playbooks to respond?",
    options: ["SIEM", "SOAR (Security Orchestration, Automation, and Response)", "EDR", "IPS"],
    correctAnswer: 1,
    explanation: "SOAR platforms integrate with other tools to automate incident response workflows and threat hunting."
  },
  {
    id: 111,
    domain: "4.0 Security Operations",
    question: "Which protocol/standard is used for automating vulnerability management, measurement, and policy compliance evaluation?",
    options: ["SCAP (Security Content Automation Protocol)", "SNMP", "Syslog", "NetFlow"],
    correctAnswer: 0,
    explanation: "SCAP is a suite of specifications (including CVE, CVSS) used to standardize security automation and compliance."
  },
  {
    id: 112,
    domain: "4.0 Security Operations",
    question: "A legal notice instructing an organization to preserve all data relevant to a pending lawsuit is called a:",
    options: ["Subpoena", "Legal Hold", "Cease and Desist", "Warrant"],
    correctAnswer: 1,
    explanation: "A Legal Hold suspends normal data destruction policies to preserve evidence for litigation."
  },
  {
    id: 113,
    domain: "4.0 Security Operations",
    question: "On a Linux system, which log file typically contains records of sudo commands and authentication attempts?",
    options: ["/var/log/auth.log", "/var/log/syslog", "/var/log/kern.log", "/var/log/dmesg"],
    correctAnswer: 0,
    explanation: "/var/log/auth.log (or /var/log/secure on RHEL) tracks authentication and authorization events."
  },
  {
    id: 114,
    domain: "5.0 Security Program Management",
    question: "Which assessment is required to identify risks to Personally Identifiable Information (PII) before deploying a new system?",
    options: ["PIA (Privacy Impact Assessment)", "Penetration Test", "Code Review", "Vulnerability Scan"],
    correctAnswer: 0,
    explanation: "A Privacy Impact Assessment (PIA) or DPIA evaluates how a project affects individual privacy and PII."
  },
  {
    id: 115,
    domain: "5.0 Security Program Management",
    question: "In the context of GDPR, who is the entity that determines the 'purpose and means' of processing personal data?",
    options: ["Data Processor", "Data Controller", "Data Subject", "DPO"],
    correctAnswer: 1,
    explanation: "The Data Controller decides why and how data is processed; the Processor acts on behalf of the Controller."
  },
  {
    id: 116,
    domain: "1.0 General Security Concepts",
    question: "Which property of digital signatures prevents a sender from claiming they did not send a specific message?",
    options: ["Non-repudiation", "Confidentiality", "Availability", "Authorization"],
    correctAnswer: 0,
    explanation: "Non-repudiation provides cryptographic proof of the origin of data, preventing denial."
  },
  {
    id: 117,
    domain: "2.0 Threats, Vulnerabilities, & Mitigations",
    question: "An attacker calls an employee pretending to be from the IT Help Desk to get their password. This specific technique is:",
    options: ["Tailgating", "Pretexting", "Dumpster Diving", "Shoulder Surfing"],
    correctAnswer: 1,
    explanation: "Pretexting involves creating a fabricated scenario (the pretext) to steal information."
  },
  {
    id: 118,
    domain: "3.0 Security Architecture",
    question: "Which wireless security mode uses individual credentials (username/password) via a RADIUS server?",
    options: ["WPA2-Personal (PSK)", "WPA3-Enterprise", "WEP", "WPS"],
    correctAnswer: 1,
    explanation: "WPA-Enterprise (WPA2 or WPA3) uses 802.1X/RADIUS for individual user authentication."
  },
  {
    id: 119,
    domain: "4.0 Security Operations",
    question: "The process of securing a system by reducing its attack surface (e.g., removing unnecessary software/services) is called:",
    options: ["Hardening", "Patching", "Sandboxing", "Fuzzing"],
    correctAnswer: 0,
    explanation: "Hardening involves securing a system by reducing its vulnerability profile."
  },
  {
    id: 120,
    domain: "5.0 Security Program Management",
    question: "Which agreement specifies the technical requirements for a secure connection between two organizations?",
    options: ["ISA (Interconnection Security Agreement)", "SLA", "BPA", "MOU"],
    correctAnswer: 0,
    explanation: "An ISA details the technical security requirements for interconnecting two IT systems."
  }
];
