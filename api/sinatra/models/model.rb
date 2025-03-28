require_relative '../database'

class Model
    attr_reader :id, :created_at

    def initialize(params = {})
        params.each do |key, value|
            instance_variable_set("@#{key}", value)
        end
    end

    def save
        if @id.nil?
            insert_into_db
        else
            update_in_db
        end
    end

    def destroy
      return false if @id.nil?
      
      query = "DELETE FROM #{self.class.table_name} WHERE id = #{@id}"
      DB.query(query)
      true
    end

    def insert_into_db
        columns = self.class.columns.join(', ')
        values = self.class.columns.map do |column|
            value = send(column)
            value.nil? ? "''" : "'#{DB.escape(value)}'"
        end.join(", ")
        

        query = "INSERT INTO #{self.class.table_name} (#{columns}) VALUES (#{values})"
        begin
            DB.query(query)
        rescue StandardError => e
            puts "Database error: #{e.message}"
            return false
        end
  
        @id = DB.last_id
        @created_at = DB.query("SELECT created_at FROM #{self.class.table_name} WHERE id = #{@id} LIMIT 1")
    end

    def update_in_db
        set_clause = self.class.columns.map { |column| "#{column} = '#{DB.escape(send(column))}'" }.join(", ")
    
        query = "UPDATE #{self.class.table_name} SET #{set_clause} WHERE id = #{@id}"
        DB.query(query)
    end

    def self.find(id)
        query = "SELECT * FROM #{table_name} WHERE id = #{id} LIMIT 1"
        result = DB.query(query).first
        return nil if result.nil?
        new(result)
    end

    def self.all
        query = "SELECT * FROM #{table_name}"
        results = DB.query(query)
        results.map { |result| new(result) }
    end

    def self.where(column, value)
        query = "SELECT * FROM #{table_name} WHERE #{column} = '#{DB.escape(value)}'"
        results = DB.query(query)
        results.map { |result| new(result) }
    end

    def self.table_name
        raise NotImplementedError, "La méthode table_name doit être définie dans la sous-classe"
    end

    def self.columns
        raise NotImplementedError, "La méthode columns doit être définie dans la sous-classe"
    end
end
