package com.example.DevFolio.Backend.config;

import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.model.Theme;
import com.example.DevFolio.Backend.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ThemeSeeder implements CommandLineRunner {

    private final ThemeRepository themeRepository;

    @Override
    public void run(String... args) {
        if (themeRepository.count() > 0) return;

        List<Theme> themes = List.of(
                Theme.builder()
                        .themeName("Terminal Dark")
                        .fonts(List.of("JetBrains Mono", "Fira Code"))
                        .fontColors(List.of("#00FF41", "#FFFFFF", "#888888"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Clean Minimal")
                        .fonts(List.of("DM Sans", "Inter"))
                        .fontColors(List.of("#0D0D0D", "#FF4D3D", "#888888"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Ocean Blue")
                        .fonts(List.of("Syne", "DM Sans"))
                        .fontColors(List.of("#E0F2FE", "#38BDF8", "#94A3B8"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Glassmorphism")
                        .fonts(List.of("Syne", "Inter"))
                        .fontColors(List.of("#FFFFFF", "#A78BFA", "#C4B5FD"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Cyberpunk")
                        .fonts(List.of("Orbitron", "Share Tech Mono"))
                        .fontColors(List.of("#F0FF00", "#FF2D78", "#00F5FF"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Aurora")
                        .fonts(List.of("Syne", "DM Sans"))
                        .fontColors(List.of("#E0F2FE", "#34D399", "#A78BFA"))
                        .tier(SubscriptionTier.PRO)
                        .build(),
                Theme.builder()
                        .themeName("Pokémon")
                        .fonts(List.of("Press Start 2P", "VT323"))
                        .fontColors(List.of("#FFCB05", "#3B4CCA", "#FF0000"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Game Console")
                        .fonts(List.of("Press Start 2P", "VT323"))
                        .fontColors(List.of("#00FF41", "#FF00FF", "#FFFF00"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Samurai")
                        .fonts(List.of("Noto Serif JP", "Inter"))
                        .fontColors(List.of("#8b0000", "#ffd700", "#1a0a00"))
                        .tier(SubscriptionTier.FREE)
                        .build(),
                Theme.builder()
                        .themeName("GitHub")
                        .fonts(List.of("Inter", "JetBrains Mono"))
                        .fontColors(List.of("#238636", "#58A6FF", "#8B949E"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("Terminal")
                        .fonts(List.of("JetBrains Mono", "Source Code Pro"))
                        .fontColors(List.of("#22c55e", "#38bdf8", "#94a3b8"))
                        .tier(SubscriptionTier.FREE)
                        .build(),

                Theme.builder()
                        .themeName("F1 Racing")
                        .fonts(List.of("Orbitron", "Rajdhani", "JetBrains Mono"))
                        .fontColors(List.of("#FF1801", "#FFD500", "#00FF9C"))
                        .tier(SubscriptionTier.PRO)  // Make it PRO tier!
                        .build(),

                Theme.builder()
                        .themeName("Ghibli")
                        .fonts(List.of("Playfair Display", "Inter"))
                        .fontColors(List.of("#34d399", "#60a5fa", "#facc15"))
                        .tier(SubscriptionTier.FREE)
                        .build()
        );


        themeRepository.saveAll(themes);
        System.out.println("Themes seeded successfully!");
    }
}