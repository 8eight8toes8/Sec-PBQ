
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const APTDetectionPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="apt_detection"
      title="APT Detection"
      scenario="You are hunting for an Advanced Persistent Threat (APT) in your network. Analyze the indicators to identify the compromise."
      objective="Identify the likely indicator of compromise (IOC) for an APT."
      questions={[
        {
          id: "q1",
          text: "You notice large amounts of data being transferred to an unknown IP address at 2:00 AM every night. What is this likely?",
          options: [
            { value: "Exfiltration", label: "Data Exfiltration" },
            { value: "Backup", label: "Scheduled Cloud Backup" },
            { value: "Update", label: "Windows Update" },
            { value: "DDoS", label: "DDoS Attack" }
          ],
          correctValue: "Exfiltration",
          feedback: "Regular, large outbound transfers at odd hours to unknown IPs are a classic sign of data exfiltration."
        },
        {
          id: "q2",
          text: "A user account shows login attempts from three different countries within 5 minutes. This is an example of:",
          options: [
            { value: "Impossible Travel", label: "Impossible Travel / Velocity" },
            { value: "VPN Usage", label: "Normal VPN Usage" },
            { value: "Load Balancing", label: "Global Load Balancing" },
            { value: "False Positive", label: "False Positive" }
          ],
          correctValue: "Impossible Travel",
          feedback: "Impossible travel indicates compromised credentials being used from multiple locations simultaneously."
        },
        {
          id: "q3",
          text: "You find a 'beaconing' signal from an internal workstation to a C2 server. What is beaconing?",
          options: [
            { value: "Heartbeat", label: "Regular check-in signal to attacker" },
            { value: "WiFi", label: "Broadcasting WiFi SSID" },
            { value: "GPS", label: "Sending GPS coordinates" },
            { value: "Ping", label: "ICMP Ping" }
          ],
          correctValue: "Heartbeat",
          feedback: "Beaconing is a regular interval communication from malware to a Command and Control (C2) server."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default APTDetectionPBQ;
