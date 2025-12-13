package com.simpleaccounts.service.migrationservices;

import java.io.FileNotFoundException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Service
public class FileStorageService {

	private  final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private final Path fileStorageLocation;

    @Autowired
    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
        	 logger.error(ERROR, ex);
        }
	    }
	    public Resource loadFileAsResource(String fileName) throws FileNotFoundException {
	        try {
	        	
	            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
				if (!filePath.startsWith(this.fileStorageLocation)) {
					throw new FileNotFoundException("File not found " + fileName);
				}
	            Resource resource = new UrlResource(filePath.toUri());
	            if (resource.exists()) {
	                return resource;
	            } else {
	                throw new FileNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {

            throw new FileNotFoundException("File not found " + fileName);
	        }
	    }
    
    public Resource loadFileAsResource1() throws FileNotFoundException {
        try {
        	
            Path filePath = this.fileStorageLocation;
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found ");
            }
        } catch (MalformedURLException ex) {

            throw new FileNotFoundException("File not found ");
        }
    }
}
