package com.example.DevFolio.Backend.util;

public class UsernameExtractor {


    public static String extractLinkedinUsername(String input){

        if(input == null || input.trim().isEmpty()){
            return null;
        }

        input = input.trim();

        if(!input.contains("linkedin.com")){
            return input;
        }

        try{

            input = input.replace("https://","")
                    .replace("http://","");

            String[] parts = input.split("/");

            for(int i = 0; i < parts.length; i++){

                if(parts[i].equals("in") && i + 1 < parts.length){
                    return parts[i+1];
                }

            }

        }catch(Exception ignored){}

        return input;
    }


    public static String extractCodeforcesName(String input){

        if(input == null || input.trim().isEmpty()){
            return null;
        }

        input = input.trim();

        if(!input.contains("codeforces.com")){
            return input;
        }

        try{

            input = input.replace("https://","")
                    .replace("http://","");

            String[] parts = input.split("/");

            for(int i = 0; i < parts.length; i++){

                if(parts[i].equals("profile") && i + 1 < parts.length){
                    return parts[i+1];
                }

            }


        }catch(Exception ignored){}

        return input;
    }



    public static String extractLeetcodeName(String input){

        if(input == null || input.trim().isEmpty()){
            return null;
        }

        input = input.trim();

        if(!input.contains("leetcode.com")){
            return input;
        }

        try{

            input = input.replace("https://","")
                    .replace("http://","");

            String[] parts = input.split("/");

            for(int i = 0; i < parts.length; i++){

                if(parts[i].equals("u") && i + 1 < parts.length){
                    return parts[i+1];
                }

            }

            if(parts.length >= 2){
                return parts[1];
            }

        }catch(Exception ignored){}

        return input;
    }

}