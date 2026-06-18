package com.thitiphatx.secondhand.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    @Value("${upload.path:uploads}")
    private String uploadPath;

    public String saveFile(MultipartFile file) throws IOException {
        Path root = Paths.get(uploadPath);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path destination = root.resolve(fileName);

        while (Files.exists(destination)) {
            fileName = UUID.randomUUID().toString() + extension;
            destination = root.resolve(fileName);
        }

        Files.copy(file.getInputStream(), destination);

        return fileName;
    }

    public void deleteFile(String fileName) {
        // 1. If no filename is passed, do nothing to prevent errors
        if (fileName == null || fileName.trim().isEmpty()) {
            return;
        }

        // 2. Locate the file by resolving the name against root directory
        Path root = Paths.get(uploadPath);
        Path fileToDelete = root.resolve(fileName).normalize();

        // Security Check: Prevent Directory Traversal attacks (e.g., passing "../filename")
        if (!fileToDelete.startsWith(root)) {
            throw new IllegalArgumentException("Invalid file path detection attempt.");
        }

        try {
        // 3. Delete the file if it exists
        Files.deleteIfExists(fileToDelete);
        } catch (IOException e) {
            System.out.println("Cannot delete file " + e.getMessage());
        }
    }
}
