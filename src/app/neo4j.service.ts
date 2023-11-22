import { Injectable } from '@angular/core';
import neo4j from 'neo4j-driver';
import Driver from 'neo4j-driver/types/driver';
import RxSession from 'neo4j-driver/types/session-rx';

@Injectable({
  providedIn: 'root'
})

export class Neo4jService {

  private driver: Driver;

  constructor() {
    // this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
    this.driver = neo4j.driver('neo4j+s://03288dbc.databases.neo4j.io', neo4j.auth.basic('neo4j', 'New@P@ssw0rd'));
   }

   getSession() {
      return this.driver.session();
   }

   close(): void {
    this.driver.close();
   }
}
