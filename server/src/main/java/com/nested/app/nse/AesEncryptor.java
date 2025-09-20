package com.nested.app.nse;

import lombok.SneakyThrows;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

public class AesEncryptor {

    private final int keySize; // bits
    private final int iterationCount;

    public AesEncryptor(int keySize, int iterationCount) {
        this.keySize = keySize; // e.g. 128
        this.iterationCount = iterationCount; // e.g. 1000
    }

    private SecretKey generateKey(String saltHex, String passphrase) throws Exception {
        byte[] salt = hexToBytes(saltHex);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        KeySpec spec = new PBEKeySpec(passphrase.toCharArray(), salt, iterationCount, keySize);
        SecretKey tmp = factory.generateSecret(spec);
        return new SecretKeySpec(tmp.getEncoded(), "AES");
    }

    public String encrypt(String saltHex, String ivHex, String passphrase, String plainText) throws Exception {
        SecretKey key = generateKey(saltHex, passphrase);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec iv = new IvParameterSpec(hexToBytes(ivHex));
        cipher.init(Cipher.ENCRYPT_MODE, key, iv);
        byte[] encrypted = cipher.doFinal(plainText.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    public String decrypt(String saltHex, String ivHex, String passphrase, String cipherText) throws Exception {
        SecretKey key = generateKey(saltHex, passphrase);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec iv = new IvParameterSpec(hexToBytes(ivHex));
        cipher.init(Cipher.DECRYPT_MODE, key, iv);
        byte[] decoded = Base64.getDecoder().decode(cipherText);
        byte[] decrypted = cipher.doFinal(decoded);
        return new String(decrypted, "UTF-8");
    }

    // ---------- Helpers ----------
    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] result = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            result[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i+1), 16));
        }
        return result;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @SneakyThrows
    public static String generateEncryptedPassword(String apiKeyMember, String apiSecretUser) {
        String separator = "|";
        long randomNumber = (long) (Math.random() * 10000000000L + 1);
        String plainText = apiSecretUser + separator + randomNumber;

        // Generate IV and salt
        SecureRandom random = new SecureRandom();
        byte[] ivBytes = new byte[16];
        random.nextBytes(ivBytes);
        String ivHex = bytesToHex(ivBytes);

        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        String saltHex = bytesToHex(saltBytes);

        System.out.println("IV  = " + ivHex);
        System.out.println("Salt= " + saltHex);

        AesEncryptor aes = new AesEncryptor(128, 1000);
        String cipherText = aes.encrypt(saltHex, ivHex, apiKeyMember, plainText);

        System.out.println("Ciphertext = " + cipherText);

        String aesPassword = ivHex + "::" + saltHex + "::" + cipherText;
        return Base64.getEncoder().encodeToString(aesPassword.getBytes(StandardCharsets.UTF_8));
    }
}
