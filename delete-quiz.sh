#!/bin/bash
# Delete all quiz responses (for testing)
curl -X DELETE http://localhost:3000/api/quiz/response/all -H "Content-Type: application/json"
echo "Quiz responses deleted"
