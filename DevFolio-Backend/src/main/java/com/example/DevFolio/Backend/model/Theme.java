package com.example.DevFolio.Backend.model;


import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "themes")
public class Theme {

    @Id
    private String id;
    @Indexed(unique = true)
    private String themeName;



    private List<String> fonts;

    private List<String> fontColors;

    private SubscriptionTier tier;
}
