package artistsearch;

import jakarta.servlet.*;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;

import com.google.gson.*;



@WebServlet("/authtoken")
public class ArtsyTokenServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	String clientId;
	String clientSecret;
	
	public void init() throws ServletException {
        super.init();
        Properties props = new Properties();
        try {
            FileInputStream in = new FileInputStream(getServletContext().getRealPath("/WEB-INF/config.properties"));
            props.load(in);
            in.close();
            clientId = props.getProperty("client_id");
            clientSecret = props.getProperty("client_secret");
        } catch (IOException e) {
            throw new ServletException("Failed to load API credentials", e);
        }
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		String token = "";
		try {
			HttpClient client = HttpClient.newHttpClient();
			HttpRequest authRequest = HttpRequest.newBuilder()
			        .uri(URI.create("https://api.artsy.net/api/tokens/xapp_token"))
			        .POST(HttpRequest.BodyPublishers.ofString("client_id=" + clientId + "&client_secret=" + clientSecret))
			        .header("Content-Type", "application/x-www-form-urlencoded")
			        .build();

			HttpResponse<String> authResponse = client.send(authRequest, HttpResponse.BodyHandlers.ofString());
			JsonObject jsonObject = JsonParser.parseString(authResponse.body()).getAsJsonObject();
			token = jsonObject.get("token").getAsString();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
        
        String jsonResponse = "{\"token\": \"" + token + "\"}";
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		out.print(jsonResponse);
		out.flush();
		out.close();
		
		
	}

}
