package adapters

import (
	"database/sql"

	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	var (
		postgres_host     = os.Getenv("POSTGRES_HOST")
		postgres_port     = os.Getenv("POSTGRES_PORT")
		postgres_user     = os.Getenv("POSTGRES_USER")
		postgres_password = os.Getenv("POSTGRES_PASSWORD")
		postgres_db       = os.Getenv("POSTGRES_DB")
	)

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", postgres_host, postgres_port, postgres_user, postgres_password, postgres_db)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
