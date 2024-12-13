<?php
class Movie {
    private $conn;
    private $table_name = "movies";

    public $id;
    public $title;
    public $description;
    public $release_date;
    public $genre;
    public $director;
    public $cast;
    public $duration;
    public $poster_url;
    public $admin_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    title = :title,
                    description = :description,
                    release_date = :release_date,
                    genre = :genre,
                    director = :director,
                    cast = :cast,
                    duration = :duration,
                    poster_url = :poster_url,
                    admin_id = :admin_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":release_date", $this->release_date);
        $stmt->bindParam(":genre", $this->genre);
        $stmt->bindParam(":director", $this->director);
        $stmt->bindParam(":cast", $this->cast);
        $stmt->bindParam(":duration", $this->duration);
        $stmt->bindParam(":poster_url", $this->poster_url);
        $stmt->bindParam(":admin_id", $this->admin_id);

        return $stmt->execute();
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Add these new methods for delete and update functionality
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }
    
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET title = :title,
                    description = :description,
                    release_date = :release_date,
                    genre = :genre,
                    director = :director,
                    cast = :cast,
                    duration = :duration";
        
        // Only update poster_url if a new poster was uploaded
        if ($this->poster_url !== null) {
            $query .= ", poster_url = :poster_url";
        }
        
        $query .= " WHERE id = :id";
    
        $stmt = $this->conn->prepare($query);
    
        // Bind the values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":release_date", $this->release_date);
        $stmt->bindParam(":genre", $this->genre);
        $stmt->bindParam(":director", $this->director);
        $stmt->bindParam(":cast", $this->cast);
        $stmt->bindParam(":duration", $this->duration);
        $stmt->bindParam(":id", $this->id);
    
        // Only bind poster_url if it was updated
        if ($this->poster_url !== null) {
            $stmt->bindParam(":poster_url", $this->poster_url);
        }
    
        return $stmt->execute();
    }
}
?>