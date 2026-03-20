package com.example.DevFolio.Backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.DevFolio.Backend.model.Enum.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@Builder
public class Users {

    @Id
    private String id;


    @Indexed(unique = true)
    private String email;

    private Role role;

    private String authProvider;

    private LocalDateTime createdAt;





}
