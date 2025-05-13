package backend.backend.controller;

import backend.backend.langchain.LangChainService;
import backend.backend.langchain.LangChainAgentService;
import backend.backend.model.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for Chatbot API
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LangChainController {

    @Autowired
    private LangChainService langChainService;

    @Autowired
    private LangChainAgentService langChainAgentService;

    /**
     * Unified endpoint for chatbot - uses Agent by default
     * @param request Request containing userId and query
     * @return Response from chatbot
     */
    @PostMapping("/chatbot")
    public ResponseEntity<ResponseObject> processChatbotQuery(@RequestBody Map<String, Object> request) {
        try {
            // Extract parameters
            Long userId = Long.valueOf(request.get("userId").toString());
            String query = (String) request.get("query");

            // Validate parameters
            if (userId == null || query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseObject(
                    "error",
                    "Invalid parameters. userId and query are required.",
                    null
                ));
            }

            // Process query using LangChain4j Agent
            String response = langChainAgentService.processQuery(userId, query);

            // Return response
            return ResponseEntity.ok(new ResponseObject(
                "success",
                "Query processed successfully",
                Map.of(
                    "response", response,
                    "query", query
                )
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ResponseObject(
                "error",
                "Error processing query: " + e.getMessage(),
                null
            ));
        }
    }

    /**
     * Trigger reindexing of database content
     * @return Status of reindexing
     */
    @PostMapping("/reindex")
    public ResponseEntity<ResponseObject> reindexContent() {
        try {
            // Trigger reindexing
            langChainService.indexDatabaseContent();

            // Return response
            return ResponseEntity.ok(new ResponseObject(
                "success",
                "Reindexing triggered successfully",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ResponseObject(
                "error",
                "Error triggering reindexing: " + e.getMessage(),
                null
            ));
        }
    }
}
