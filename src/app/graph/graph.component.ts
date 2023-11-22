import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DataSet } from 'vis-data';
import * as vis from 'vis';
import { Neo4jService } from '../neo4j.service';
import { NONE_TYPE } from '@angular/compiler';
import neo4j, { Integer } from 'neo4j-driver';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})

export class GraphComponent implements OnInit, OnDestroy {

  @ViewChild('networkElement', {static:true}) networkElement!: ElementRef;

  @ViewChild('graph') graph!: ElementRef;
  query = "Text Query";
  selectedValue = "Select Faculty";
  selectedResearchArea = "Select Research Area";

  network: any;
  questionNo: Number = 0;
  
  // private network!: Network;
  nodes: vis.Node[] = [];//new DataSet<any>([]);
  edges: vis.Edge[] = [];//new DataSet<any>([]);

  public varN1:any[] = [];
  public varN2: any[] = [];
  public arrList: any[] = [];

  noGraphMsg = 'No Graph to Display';

  constructor(private route: ActivatedRoute, private neo4jService: Neo4jService) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(param => {
      this.questionNo = +param['questionNo'];; // Access the query parameter 'name'
      console.log('question No: '+this.questionNo);
    });

    if(this.questionNo === 3  || this.questionNo == 4) {
      this.renderData();
    }
  
   
  }


  async renderData() {
    // result.records[0]._fields[0]
    this.setMessage();
    const session = this.neo4jService.getSession();
    try {

      this.query = this.fetchQuery();                            
      const result = await session.run(this.query);

      console.log(JSON.stringify(result));
      
      if(result && result.records.length > 0) {
       this.arrList = [];
        result.records.forEach(record => {
        
          if(this.questionNo == 3) {
            console.log(record.get('sfield').properties.name);
            this.arrList.push(record.get('sfield').properties.name);
          } else if(this.questionNo == 5) {
            console.log(record.get('faculty').properties.faculty_name);
            this.arrList.push(record.get('faculty').properties.faculty_name);
          }
          
  
        });
      }
      // const container = document.getElementById('graph');
    } catch(error) {
      console.error('Error loading graph data: ERROR', error);
    } finally {
      // console.log(resu)
      session.close();
    // }
  }
  }
  

  fetchQuery() {

    if(this.questionNo == 1) {
      return  'MATCH (n:Faculty)-[r:RESEARCHS_IN]->(m:Research_Field) '+ 'WHERE n.faculty_name = "'+ this.selectedValue + 
      '" RETURN n,r,m';
    } else if(this.questionNo == 2) {
      return 'MATCH (n:Faculty)-[r:RESEARCHS_IN]-(OtherNodes) Where OtherNodes.name = "' +this.selectedResearchArea + '" RETURN n, OtherNodes as m,r';
    } else if(this.questionNo == 3) {
        return 'MATCH (f:Faculty)-[:RESEARCHS_IN]-(field:Research_Field),(f:Faculty)-[:RESEARCHS_IN]-(sfield:Super_Research_Field) '+
        'With count(sfield) as s_count, sfield WHERE s_count >= 5 RETURN sfield'; 
    } else if(this.questionNo == 4) {
      return 'MATCH (subs)-[:SUB_FIELD_OF]->(OtherNodes:Super_Research_Field) WHERE NOT EXISTS((:Faculty)-[:RESEARCHS_IN]->(OtherNodes))'+
      ' WITH DISTINCT OtherNodes as SuperFields WITH collect(SuperFields.name) as originallist MATCH (subs)-[:SUB_FIELD_OF]->(SuperFields)'+
      ' WHERE EXISTS((:Faculty)-[:RESEARCHS_IN]->(subs)) WITH DISTINCT SuperFields as SuperFieldss, originallist WITH *,collect(SuperFieldss.name) as newlist'+
      ' UNWIND newlist as onelist WITH collect(onelist) as thislist, originallist Return [x IN originallist WHERE NOT x IN thislist] as final'
    } else if(this.questionNo == 5) {
      return 'MATCH (faculty:Faculty)-[:RESEARCHS_IN]-(OtherNodes:Super_Research_Field), (faculty:Faculty)-[:RESEARCHS_IN]-(OtherNodess:Research_Field)'+
      ' Where OtherNodes.name = "Data Mining" and OtherNodess.name = "Machine Learning" RETURN faculty'
    }

    return "";
  
  }

  async renderGraph(facultyId:any): Promise<void> {

    const session = this.neo4jService.getSession();
    // const result = await session.run('MATCH (n)-[r]->(m) return n, r, m');
    try {

      this.query = this.fetchQuery();                            
      const result = await session.run(this.query);

      console.log(JSON.stringify(result));
      
      this.nodes = [];
      this.edges = [];
      this.varN1 = [];
      this.varN2 = [];

      if(result && result.records.length > 0) {
        
        this.noGraphMsg = '';
  
        result.records.forEach(record => {
        
          const node1 = record.get('n');
          const node2 = record.get('m');
          const edge =  record.get('r');
  
  
          if(node1 && !this.varN1.includes(node1.elementId)) {
            console.log('if node 1');
            console.log(node1);
            this.varN1.push(node1.elementId);
            this.nodes.push({id: node1.elementId, label: node1.properties.faculty_name});
          } 
          if(node2 && !this.varN1.includes(node2.elementId)) {
            this.varN1.push(node2.elementId);
            this.nodes.push({id: node2.elementId, label: node2.properties.name});
          }
          if(edge && !this.varN2.includes(edge.elementId)) {
            this.varN2.push(edge.elementId);
            this.edges.push({ id: edge.elementId, from: node1.elementId, to: node2.elementId, label: edge.type});
          }
  
        });
  
        const nodes = new vis.DataSet(this.nodes);
        const edges = new vis.DataSet(this.edges);
  
        const data = {
          nodes: nodes,
          edges: edges,
        };
  
        const options = {
          autoResize: true,
          width: '1000px',
          height: '600px',
          clickToUse: true,
          layout: {
            hierarchical: {
              enabled:false,
              levelSeparation: 2,
              // improvedLayout: true
              
            }  
          },
  
  
          nodes:{
            color: {
              border: '#2B7CE9',
              background: '#97C2FC',
              highlight: {
                border: '#2B7CE9',
                background: '#D2E5FF'
              },
              hover: {
                border: '#2B7CE9',
                background: '#D2E5FF'
              }
            },
            scaling: {
              min: 15,
              max: 25,
              label: false
            },
            widthConstraint: {
              minimum: 100,
              maximum: 200
            },
            
            chosen: false,
            shape: 'circle',
            size: 25
          },
          widthConstraint: edges,
  
          edges:{
            arrowStrikethrough: true,
            color: {
              color:'#848484',
            },
            hoverWidth: 1.5,
            length: 400,
            // shadow: true,
            smooth: false,
  
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 1,
                type: "arrow"
              },
            },
            font: {
              align: 'middle',
            },
            scaling: {
              label: true
            },
            widthConstraint: {
              maximum: 200
            },
            chosen: true,
          },
  
          physics: {
            stabilization: true
          },
        }
       
        setTimeout(() => {
          const container = document.getElementById('graph-container');
          if(container) {
            container.innerHTML = '';
            this.network = new vis.Network(container, data, options);
          }
        }, 10);
  
      } else {
        this.setMessage();
      }
      

      // const container = document.getElementById('graph');
    } catch(error) {
      console.error('Error loading graph data: ERROR', error);
    } finally {
      // console.log(resu)
      session.close();
    // }
  }
}
 
  setMessage() {
    this.noGraphMsg = 'No Graph to Display';
  }

  // private async loadGraphData(): Promise<void> {
  //   this.nodes = [];
  //   this.edges = [];
  
    
  //   const session = this.neo4jService.getSession();
  //   try {

  //     // console.log('Container: ', container)
    
  //     const result = await session.run('MATCH (n)-[r]->(m) return n, r, m');


  //     // console.log()
      
  //     // console.log('Records:::: '+JSON.stringify(result));
      
  //     // MATCH(user: User) return n, m, r
  //     // const result = ''
      
      
  //     result.records.forEach(record => {
  //       // console.log("bazinga");
  //       // console.log('Records:::: '+JSON.stringify(record));
  //       const node1 = record.get('n');
  //       const node2 = record.get('m');
  //       const edge = record.get('r');


  //       if(!this.varN1.includes(node1.elementId)) {
  //         console.log('if node 1');
  //         console.log(node1);
  //         this.varN1.push(node1.elementId);
  //         this.nodes.push({id: node1.elementId, label: node1.properties.name});
  //       } 
  //       if(!this.varN1.includes(node2.elementId)) {
  //         this.varN1.push(node2.elementId);
  //         this.nodes.push({id: node2.elementId, label: node2.properties.name});
  //       }
  //       if(!this.varN2.includes(edge.elementId)) {
  //         this.varN2.push(edge.elementId);
  //         this.edges.push({ id: edge.elementId, from: node1.elementId, to: node2.elementId, label: edge.type});
  //       }

  //     });

  //     const nodes = new vis.DataSet(this.nodes);
  //     const edges = new vis.DataSet(this.edges);

  //     const data = {
  //       nodes: nodes,
  //       edges: edges,
  //     };

  //     const options = {
  //       autoResize: true,
  //       width: '1000px',
  //       height: '500px',
  //       clickToUse: true,
  //       layout: {
  //         hierarchical: {
  //           enabled:false,
  //           levelSeparation: 2,
  //           // improvedLayout: true
            
  //         }  
  //       },


  //       nodes:{
  //         color: {
  //           border: '#2B7CE9',
  //           background: '#97C2FC',
  //           highlight: {
  //             border: '#2B7CE9',
  //             background: '#D2E5FF'
  //           },
  //           hover: {
  //             border: '#2B7CE9',
  //             background: '#D2E5FF'
  //           }
  //         },
  //         scaling: {
  //           min: 15,
  //           max: 25,
  //           label: false
  //         },
  //         widthConstraint: {
  //           minimum: 100,
  //           maximum: 200
  //         },
          
  //         chosen: false,
  //         shape: 'circle',
  //         size: 25
  //       },
  //       widthConstraint: edges,

  //       edges:{
  //         arrowStrikethrough: true,
  //         color: {
  //           color:'#848484',
  //         },
  //         hoverWidth: 1.5,
  //         length: 400,
  //         // shadow: true,
  //         smooth: false,

  //         arrows: {
  //           to: {
  //             enabled: true,
  //             scaleFactor: 1,
  //             type: "arrow"
  //           },
  //         },
  //         font: {
  //           align: 'middle',
  //         },
  //         scaling: {
  //           label: true
  //         },
  //         widthConstraint: {
  //           maximum: 200
  //         },
  //         chosen: true,
  //       },

  //       physics: {
  //         stabilization: true
  //       },
  //     }

  //     const container = document.getElementById('graph-container');
  //     if(container) {
  //       container.innerHTML = '';
  //       this.network = new vis.Network(container, data, options);
  //     }
      


  //     // const container = document.getElementById('graph');
  //   } catch(error) {
  //     console.error('Error loading graph data: ERROR', error);
  //   } finally {
  //     // console.log(resu)
  //     session.close();
  //   }

  // }
  
  ngOnDestroy(): void {

    this.neo4jService.close();
    
  }

}
