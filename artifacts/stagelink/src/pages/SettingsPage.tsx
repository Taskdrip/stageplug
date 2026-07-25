import { useState, useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, Music2, Globe, Instagram, Twitter, Youtube,
  Save, CheckCircle2, Shield, Bell, Palette, ChevronRight
} from "lucide-react";
import {
  useGetMe,
  useUpdateMe,
  useGetMyArtistProfile,
  useUpdateArtistProfile,
} from "@workspace/api-client-react";
import { useTheme } from "next-themes";

const GENRES = ["Afrobeats", "Hip-Hop", "R&B", "Pop", "Electronic", "Jazz", "Classical", "Rock", "Reggae", "Gospel", "Latin", "House", "Drill", "Amapiano", "Soul"];
const ARTIST_TYPES = ["Singer", "Rapper", "DJ", "Producer", "Instrumentalist", "Dancer", "MC", "Band", "Songwriter"];

type SettingsTab = "profile" | "artist" | "appearance" | "privacy";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);

  const { data: me } = useGetMe();
  const updateMe = useUpdateMe();
  const { data: artistProfile } = useGetMyArtistProfile();
  const updateArtist = useUpdateArtistProfile();
  const { theme, setTheme } = useTheme();

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Artist form state
  const [bio, setBio] = useState("");
  const [artistType, setArtistType] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bookingPrice, setBookingPrice] = useState<number | "">("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");

  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName || "");
      setAvatarUrl(me.avatarUrl || "");
    }
  }, [me]);

  useEffect(() => {
    if (artistProfile) {
      setBio(artistProfile.bio || "");
      setArtistType(artistProfile.artistType || "");
      setCity(artistProfile.city || "");
      setCountry(artistProfile.country || "");
      setBookingPrice(artistProfile.bookingPrice ?? "");
      setSelectedGenres(artistProfile.genres || []);
      setInstagram(artistProfile.socialLinks?.instagram || "");
      setTwitter(artistProfile.socialLinks?.twitter || "");
      setYoutube(artistProfile.socialLinks?.youtube || "");
    }
  }, [artistProfile]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveProfile = () => {
    updateMe.mutate({ data: { displayName, avatarUrl: avatarUrl || undefined } }, { onSuccess: flashSaved });
  };

  const handleSaveArtist = () => {
    updateArtist.mutate({
      data: {
        bio: bio || undefined,
        artistType: artistType || undefined,
        city: city || undefined,
        country: country || undefined,
        bookingPrice: bookingPrice !== "" ? Number(bookingPrice) : undefined,
        genres: selectedGenres,
        socialLinks: {
          instagram: instagram || undefined,
          twitter: twitter || undefined,
          youtube: youtube || undefined,
        },
      },
    }, { onSuccess: flashSaved });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "artist", label: "Artist Info", icon: Music2 },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
  ];

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, artist profile, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <ChevronRight className={`w-4 h-4 ml-auto transition-opacity ${activeTab === tab.id ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 glass rounded-2xl p-8">
          {saved && (
            <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-1">Public Profile</h2>
                <p className="text-muted-foreground text-sm">This is how you appear across the platform.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-white/10">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-white/80">Avatar URL</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://your-avatar-url.com/photo.jpg"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                  <p className="text-xs text-muted-foreground">Paste a publicly accessible image URL.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your artist name"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={updateMe.isPending}
                className="h-11 px-6 bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMe.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {/* Artist Tab */}
          {activeTab === "artist" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-1">Artist Profile</h2>
                <p className="text-muted-foreground text-sm">Help bookers and fans discover you. Complete profiles get 3x more bookings.</p>
              </div>

              {/* Artist Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Artist Type</label>
                <div className="flex flex-wrap gap-2">
                  {ARTIST_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setArtistType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        artistType === type
                          ? "bg-primary border-primary text-white"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Tell the world about your music, story, and what makes you unique..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Country</label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Booking Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Starting Booking Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={bookingPrice}
                    onChange={(e) => setBookingPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    min={0}
                    className="pl-7 bg-black/20 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selectedGenres.includes(genre)
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/20"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Social Links
                </h3>
                {[
                  { icon: Instagram, label: "Instagram", value: instagram, set: setInstagram, ph: "https://instagram.com/yourhandle" },
                  { icon: Twitter, label: "Twitter / X", value: twitter, set: setTwitter, ph: "https://twitter.com/yourhandle" },
                  { icon: Youtube, label: "YouTube", value: youtube, set: setYoutube, ph: "https://youtube.com/@yourchannel" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      value={s.value}
                      onChange={(e) => s.set(e.target.value)}
                      placeholder={s.ph}
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveArtist}
                disabled={updateArtist.isPending}
                className="h-11 px-6 bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateArtist.isPending ? "Saving..." : "Save Artist Profile"}
              </Button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-1">Appearance</h2>
                <p className="text-muted-foreground text-sm">Customize how StageLink looks for you.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-white/80">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "dark", label: "Dark", preview: "bg-gray-900 border-gray-700" },
                    { value: "light", label: "Light", preview: "bg-gray-50 border-gray-200" },
                    { value: "system", label: "System", preview: "bg-gradient-to-br from-gray-900 to-gray-50 border-gray-400" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as "dark" | "light" | "system")}
                      className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === t.value
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:border-white/20 bg-white/5"
                      }`}
                    >
                      <div className={`w-full h-16 rounded-lg border ${t.preview}`} />
                      <span className={`text-sm font-medium ${theme === t.value ? "text-primary" : "text-muted-foreground"}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-1">Privacy & Security</h2>
                <p className="text-muted-foreground text-sm">Manage your account security and data preferences.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Bell, title: "Email Notifications", desc: "Receive booking requests and platform updates via email.", enabled: true },
                  { icon: Shield, title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account.", enabled: false },
                  { icon: Globe, title: "Public Profile", desc: "Allow anyone to view your artist profile.", enabled: true },
                  { icon: User, title: "Show on Discovery", desc: "Appear in search results and discovery feeds.", enabled: true },
                ].map((item) => (
                  <div key={item.title} className="flex items-start justify-between p-5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={item.enabled
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : "border-white/10 bg-white/5 text-muted-foreground"}
                      >
                        {item.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground">
                  Account security is managed through your authentication provider. 
                  To change your password or manage connected devices, please use your account provider's settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
