package backend.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.Arrays;
import java.util.List;

@Component
public class ServerPortConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    private static final Logger logger = LoggerFactory.getLogger(ServerPortConfig.class);

    @Value("${server.port}")
    private int serverPort;

    @Value("${server.port.fallback:8090}")
    private int fallbackPort;

    @Value("${server.port.additional-ports:8090,8091,8092}")
    private String additionalPorts;

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        int port = serverPort;
        
        // Check if primary port is available
        if (!isPortAvailable(port)) {
            logger.warn("Primary port {} is already in use. Trying fallback ports...", port);
            
            // Try fallback port
            if (isPortAvailable(fallbackPort)) {
                port = fallbackPort;
                logger.info("Using fallback port: {}", port);
            } else {
                // Try additional ports if specified
                List<String> ports = Arrays.asList(additionalPorts.split(","));
                for (String additionalPort : ports) {
                    try {
                        int p = Integer.parseInt(additionalPort.trim());
                        if (isPortAvailable(p)) {
                            port = p;
                            logger.info("Using alternative port: {}", port);
                            break;
                        }
                    } catch (NumberFormatException e) {
                        logger.error("Invalid port number in additional-ports: {}", additionalPort);
                    }
                }
            }
        }
        
        logger.info("Configuring server to use port: {}", port);
        factory.setPort(port);
    }
    
    /**
     * Check if a port is available.
     * 
     * @param port the port to check
     * @return true if the port is available, false otherwise
     */
    private boolean isPortAvailable(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            serverSocket.setReuseAddress(true);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
} 