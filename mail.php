<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $to = "recipient@example.com"; // Replace with the recipient's email address
    $subject = "New Form Submission";
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    // Build the email content
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message";

    // Additional headers
    $headers = "From: $email";

    // Send the email
    if (mail($to, $subject, $email_content, $headers)) {
        echo "Email sent successfully!";
    } else {
        echo "Error: Unable to send email.";
    }
}
?>
