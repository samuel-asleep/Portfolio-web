import { Card } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

interface ContactProps {
  info?: ContactInfo;
}

const defaultInfo: ContactInfo = {
  email: "your.email@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  github: "https://github.com/yourusername",
  linkedin: "https://linkedin.com/in/yourusername",
  twitter: "https://twitter.com/yourusername",
};

export default function Contact({ info = defaultInfo }: ContactProps) {
  const { toast } = useToast();

  const copyEmail = () => {
    if (info.email) {
      navigator.clipboard.writeText(info.email).then(() => {
        toast({
          title: "Email Copied!",
          description: `${info.email} copied to clipboard`,
        });
      }).catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy email to clipboard",
          variant: "destructive",
        });
      });
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: info.email,
      href: `mailto:${info.email}`,
      onClick: copyEmail,
      testId: "contact-email",
    },
    {
      icon: Phone,
      label: "Phone",
      value: info.phone,
      href: `tel:${info.phone}`,
      testId: "contact-phone",
    },
    {
      icon: MapPin,
      label: "Location",
      value: info.location,
      testId: "contact-location",
    },
  ];

  const socialLinks = [
    { icon: SiGithub, href: info.github, label: "GitHub", testId: "link-github" },
    { icon: SiLinkedin, href: info.linkedin, label: "LinkedIn", testId: "link-linkedin" },
    { icon: SiX, href: info.twitter, label: "X / Twitter", testId: "link-twitter" },
  ].filter(link => link.href);

  return (
    <section id="contact" className="py-20 px-6 lg:px-8" data-testid="section-contact">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center" data-testid="text-contact-heading">
          Get In Touch
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Have a project in mind or want to collaborate? Feel free to reach out!
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactItems.map((item) => (
            <Card
              key={item.label}
              className="p-6 text-center space-y-3 hover:scale-105 hover-elevate active-elevate-2 transition-all glassmorphism"
              data-testid={item.testId}
            >
              <div className="flex justify-center">
                <div className="p-3 bg-primary/20 rounded-full glow-effect-sm">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    className="text-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                    data-testid={`link-${item.testId}`}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-foreground font-medium" data-testid={`text-${item.testId}`}>{item.value}</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-card border border-card-border rounded-full hover:scale-110 hover-elevate active-elevate-2 transition-all glow-effect-sm"
                data-testid={social.testId}
                aria-label={social.label}
              >
                <social.icon className="h-6 w-6 text-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
