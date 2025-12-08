/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.utils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Stream;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;

import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.constant.FileTypeEnum;

/**
 *
 * @author admin
 */
@Slf4j
@Component
public class FileHelper {

	 @Value("resources/migrationuploadedfiles/")
	@Autowired
	private String basePath;

	@Getter @Setter
	public static String rootPath;

	private final String LOGO_IMAGE_PATH = "images/SimpleAccountsLogoFinalFinal.png";

	public String readFile(String fileName) throws IOException {
		try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();

			while (line != null) {
				sb.append(line);
				sb.append("\n");
				line = br.readLine();
			}
			return sb.toString();
		}
	}

	public ByteArrayInputStream readFileAttachment(String fileName) throws IOException {
		try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();

			while (line != null) {
				sb.append(line);
				sb.append("\n");
				line = br.readLine();
			}
			return new ByteArrayInputStream(sb.toString().getBytes());
		}
	}

	public MimeMultipart getMessageBody(String htmlText) throws MessagingException {
		ClassLoader classLoader = getClass().getClassLoader();
		File file;
		if (classLoader.getResource(LOGO_IMAGE_PATH).getFile() != null) {
			file = new File(classLoader.getResource(LOGO_IMAGE_PATH).getFile());

			String logoImagePath = file.getAbsolutePath();
			// This mail has 2 part, the BODY and the embedded image
			MimeMultipart multipart = new MimeMultipart("related");

			// first part (the html)
			BodyPart messageBodyPart = new MimeBodyPart();

			messageBodyPart.setContent(htmlText, "text/html");
			// add it
			multipart.addBodyPart(messageBodyPart);

			// second part (the image)
			messageBodyPart = new MimeBodyPart();
			DataSource fds = new FileDataSource(logoImagePath);

			messageBodyPart.setDataHandler(new DataHandler(fds));
			messageBodyPart.setHeader("Content-ID", "<simpleaccountslogo>");

			// add image to the multipart
			multipart.addBodyPart(messageBodyPart);

			return multipart;
		}
		return new MimeMultipart();
	}

	public String saveFile(MultipartFile multipartFile, FileTypeEnum fileTypeEnum) throws IOException {
		String filePath = "";
		String storagePath = FileHelper.getRootPath() + basePath;
		createFolderIfNotExist(storagePath);
		Map<String, String> map = getFileName(multipartFile, fileTypeEnum);
		for (Map.Entry<String, String> entry : map.entrySet()) {
			File folder = new File(storagePath + entry.getKey());
			if (!folder.isDirectory()) {
				folder.mkdirs();
			}
			File file = new File(storagePath + entry.getValue());
			if (!file.exists()) {
				file.createNewFile();
			}
			multipartFile.transferTo(file);
			filePath = entry.getValue();
		}
		return filePath;
	}
	public InputStream writeFile(String data,String fileName) throws IOException {

		File file = new File(fileName);
		try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
			writer.write(data);
		}
		return new FileInputStream(file);


	}


	public void createFolderIfNotExist(String filePath) {
		File folder = new File(filePath);

		if (!folder.exists()) {
			folder.mkdirs();
		}
	}

	public Map<String, String> getFileName(MultipartFile multipartFile, FileTypeEnum fileTypeEnum) {
		Map<String, String> map = new HashMap<>();
		if (multipartFile.getOriginalFilename() != null) {
			String dateString = new SimpleDateFormat("yyyyMMdd").format(new Date());
			String fileExtension = multipartFile.getOriginalFilename()
					.substring(multipartFile.getOriginalFilename().lastIndexOf('.') + 1);
			UUID uuid = UUID.randomUUID();
			String fileName = uuid.toString() + "." + fileExtension;
			switch (fileTypeEnum) {
			case EXPENSE:
				map.put(dateString + File.separator, dateString + File.separator + "ex-" + fileName);
				break;
			case CUSTOMER_INVOICE:
				map.put(dateString + File.separator, dateString + File.separator + "ci-" + fileName);
				break;
			case SUPPLIER_INVOICE:
				map.put(dateString + File.separator, dateString + File.separator + "si-" + fileName);
				break;
			case TRANSATION:
				map.put(dateString + File.separator, dateString + File.separator + "tr-" + fileName);
				break;
			case RECEIPT:
				map.put(dateString + File.separator, dateString + File.separator + "re-" + fileName);
				break;
			case PURCHASE_ORDER:
				map.put(dateString + File.separator, dateString + File.separator + "po-" + fileName);
				break;
			default:
				map.put(dateString + File.separator, dateString + File.separator + fileName);
			}
			return map;
		}
		return null;
	}

	public String getFileExtension(String fileName) {
		if (fileName != null && !fileName.equals("")) {
			return fileName.substring(fileName.lastIndexOf('.') + 1);
		}
		return null;
	}

	public String convertFilePthToUrl(String filePath) {
		String url = filePath;

		if (filePath.contains(File.separator)) {
			url = url.replace("\\", "/");
		}

		return url;
	}
	/**
	 * Save the uploaded folder under basePath
	 * @param folderPath
	 * @param files
	 */
	public  List<DataMigrationRespModel>  saveMultiFile(String folderPath, MultipartFile[] files) {
		List<DataMigrationRespModel> list = new ArrayList<>();
		if (files == null || files.length == 0) {
			return list;
		}
		if (folderPath.endsWith("/")) {
			folderPath = folderPath.substring(0, folderPath.length() - 1);
		}
		createFolderIfNotExist(folderPath);
		for (MultipartFile file : files) {
			// Sanitize filename to prevent path traversal attacks
			String originalFilename = file.getOriginalFilename();
			if (originalFilename == null || originalFilename.isEmpty()) {
				continue;
			}
			String sanitizedFilename = new File(originalFilename).getName();
			if (sanitizedFilename.isEmpty() || sanitizedFilename.startsWith(".")) {
				continue;
			}
			String filePath = folderPath + "/" + sanitizedFilename;

			File dest = new File(filePath);
			// Validate that the resolved path is within the expected folder
			try {
				if (!dest.getCanonicalPath().startsWith(new File(folderPath).getCanonicalPath())) {
					log.error("Invalid file path detected: {}", filePath);
					continue;
				}
			} catch (IOException e) {
				log.error("Error validating file path", e);
				continue;
			}
			try {
				file.transferTo(dest);
				DataMigrationRespModel dataMigrationRespModel = new DataMigrationRespModel();
				dataMigrationRespModel.setFileName(sanitizedFilename);
				long count;
				try (Stream<String> lines = Files.lines(dest.toPath())) {
					count = lines.count();
				}
				dataMigrationRespModel.setRecordCount(count-1);
				dataMigrationRespModel.setRecordsMigrated(0L);
				list.add(dataMigrationRespModel);

			} catch (IllegalStateException | IOException e) {
				log.error("Error processing file", e);
			}
		}
		return list;
	}
}
