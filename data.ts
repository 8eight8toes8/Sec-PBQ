import { PBQModule, DifficultyLevel } from './types';

export const pbqModules: PBQModule[] = [
  // Foundational (5)
  {
    id: 'password_policy',
    title: 'Password Policy Configuration',
    description: 'Configure complexity, expiration, and lockout settings for a secure domain.',
    difficulty: DifficultyLevel.Foundational,
    category: 'Identity & Access',
    icon: 'fa-key'
  },
  {
    id: 'common_ports',
    title: 'Identify Common Ports',
    description: 'Match services to their default secure and insecure ports.',
    difficulty: DifficultyLevel.Foundational,
    category: 'Network Security',
    icon: 'fa-network-wired'
  },
  {
    id: 'basic_access_control',
    title: 'Basic Access Control Setup',
    description: 'Implement standard ACLs for file system permissions.',
    difficulty: DifficultyLevel.Foundational,
    category: 'Identity & Access',
    icon: 'fa-user-lock'
  },
  {
    id: 'network_labeling',
    title: 'Network Diagram Labeling',
    description: 'Identify and label network zones and security appliances.',
    difficulty: DifficultyLevel.Foundational,
    category: 'Network Security',
    icon: 'fa-project-diagram'
  },
  {
    id: 'basic_ir_steps',
    title: 'Incident Response Steps',
    description: 'Order the phases of the incident response lifecycle correctly.',
    difficulty: DifficultyLevel.Foundational,
    category: 'SOC Operations',
    icon: 'fa-clipboard-list'
  },

  // Intermediate (8)
  {
    id: 'firewall',
    title: 'Firewall Rule Configuration',
    description: 'Configure allow/deny rules for traffic filtering.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Network Security',
    icon: 'fa-fire'
  },
  {
    id: 'snort_firewall',
    title: 'Snort IDS & Firewall Rules',
    description: 'Analyze IDS alerts and configure iptables to block malicious traffic.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Network Security',
    icon: 'fa-shield-dog'
  },
  {
    id: 'siem',
    title: 'SIEM Log Analysis',
    description: 'Analyze aggregated logs to identify potential security events.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'SOC Operations',
    icon: 'fa-search'
  },
  {
    id: 'risk',
    title: 'Risk Assessment',
    description: 'Calculate ALE/SLE and categorize risk types.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'GRC',
    icon: 'fa-chart-pie'
  },
  {
    id: 'cloud',
    title: 'Cloud Security Posture',
    description: 'Assess and secure cloud configurations.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'App Security',
    icon: 'fa-cloud'
  },
  {
    id: 'vuln',
    title: 'Vulnerability Management',
    description: 'Prioritize vulnerabilities based on CVSS and impact.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'SOC Operations',
    icon: 'fa-bug'
  },
  {
    id: 'access',
    title: 'Access Control Matrix',
    description: 'Design an RBAC matrix for departmental access.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Identity & Access',
    icon: 'fa-table'
  },
  {
    id: 'wireless_config',
    title: 'Wireless Security Config',
    description: 'Secure a WPA3 Enterprise wireless network.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Network Security',
    icon: 'fa-wifi'
  },
  {
    id: 'crypto_basics',
    title: 'Cryptography Basics',
    description: 'Select appropriate encryption algorithms for data at rest and in transit.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Cryptography',
    icon: 'fa-lock'
  },
  {
    id: 'secure_protocols',
    title: 'Secure Protocols Implementation',
    description: 'Configure servers to use secure protocols (SSH, HTTPS, SFTP) instead of insecure ones.',
    difficulty: DifficultyLevel.Intermediate,
    category: 'Network Security',
    icon: 'fa-shield-alt'
  },

  // Advanced (8 + 3 new + 1 lab)
  {
    id: 'pki_certs',
    title: 'PKI & Certificate Management',
    description: 'Manage certificate lifecycles and chain of trust.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Cryptography',
    icon: 'fa-certificate'
  },
  {
    id: 'multi_zone_firewall',
    title: 'Multi-Zone Firewall',
    description: 'Complex rulesets for DMZ, Intranet, and Extranet.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Network Security',
    icon: 'fa-shield-virus'
  },
  {
    id: 'apt_detection',
    title: 'APT Detection',
    description: 'Identify indicators of compromise for advanced persistent threats.',
    difficulty: DifficultyLevel.Advanced,
    category: 'SOC Operations',
    icon: 'fa-user-secret'
  },
  {
    id: 'network_architecture',
    title: 'Secure Network Architecture',
    description: 'Design a segmented network with defense-in-depth.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Network Security',
    icon: 'fa-sitemap'
  },
  {
    id: 'privilege_escalation',
    title: 'Privilege Escalation',
    description: 'Detect and mitigate vertical and horizontal escalation attacks.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Endpoint Security',
    icon: 'fa-arrow-up'
  },
  {
    id: 'req_1',
    title: 'Secure Config Req 1',
    description: 'Advanced server hardening requirements.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Endpoint Security',
    icon: 'fa-server'
  },
  {
    id: 'req_2',
    title: 'Secure Config Req 2',
    description: 'Compliance auditing and remediation.',
    difficulty: DifficultyLevel.Advanced,
    category: 'GRC',
    icon: 'fa-clipboard-check'
  },
  {
    id: 'req_3',
    title: 'Secure Config Req 3',
    description: 'Zero trust architecture implementation.',
    difficulty: DifficultyLevel.Advanced,
    category: 'Identity & Access',
    icon: 'fa-fingerprint'
  },
  {
    id: 'ddos_mitigation',
    title: 'DDoS Mitigation Strategy',
    description: 'Implement controls to detect and mitigate Distributed Denial of Service attacks.',
    difficulty: DifficultyLevel.Advanced,
    category: 'SOC Operations',
    icon: 'fa-network-wired'
  },
  {
    id: 'forensic_investigation',
    title: 'Digital Forensics Investigation',
    description: 'Analyze disk images and memory dumps to reconstruct a security incident.',
    difficulty: DifficultyLevel.Advanced,
    category: 'SOC Operations',
    icon: 'fa-search-plus'
  },
  {
    id: 'cloud_iam_policies',
    title: 'Cloud IAM Policy Auditing',
    description: 'Audit complex cloud identity and access management policies for least privilege violations.',
    difficulty: DifficultyLevel.Advanced,
    category: 'App Security',
    icon: 'fa-id-card'
  },
  {
    id: 'sql_injection_pcap',
    title: 'Attacking a mySQL Database',
    description: 'Analyze PCAP files in Wireshark to investigate a SQL Injection attack.',
    difficulty: DifficultyLevel.Advanced,
    category: 'App Security',
    icon: 'fa-network-wired'
  }
];