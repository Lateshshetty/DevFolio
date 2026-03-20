package com.example.DevFolio.Backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.DevFolio.Backend.config.CloudinaryConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    public Map uploadImage(MultipartFile file) throws IOException {
        validateImage(file);
        return cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder","devfolio_profiles")
        );
    }
    private void validateImage(MultipartFile file){

        if(file.isEmpty()){
            throw new RuntimeException("File is empty");
        }

        if(!file.getContentType().startsWith("image/")){
            throw new RuntimeException("Only image files are allowed");
        }

        if(file.getSize() > 2 * 1024 * 1024){
            throw new RuntimeException("Max file size is 2MB");
        }
    }



    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId,ObjectUtils.emptyMap());
    }
}
